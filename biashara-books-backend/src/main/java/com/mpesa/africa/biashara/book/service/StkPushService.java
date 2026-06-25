package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.FastDukaStkPushRequest;
import com.mpesa.africa.biashara.book.model.dto.request.StkPushInitiateRequest;
import com.mpesa.africa.biashara.book.model.dto.response.FastDukaTransactionResponse;
import com.mpesa.africa.biashara.book.model.dto.response.StkPushInitiateResponse;
import com.mpesa.africa.biashara.book.model.dto.response.StkPushStatusResponse;
import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StkPushService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    @Qualifier("fastDukaWebClient")
    private final WebClient fastDukaWebClient;

    public Mono<StkPushInitiateResponse> initiateStkPush(StkPushInitiateRequest request, UUID userId) {
        log.info("Initiating STK push for user: {}, phone: {}", userId, request.getPhoneNumber());

        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> {
                    if (user.getCurrentBusinessId() == null) {
                        return Mono.error(new CustomException("No active business selected"));
                    }
                    return businessRepository.findById(user.getCurrentBusinessId());
                })
                .switchIfEmpty(Mono.error(new CustomException("Business not found")))
                .flatMap(business -> {
                    validateFastDukaCredentials(business);

                    FastDukaStkPushRequest payload = FastDukaStkPushRequest.builder()
                            .customerAccountNumber(request.getPhoneNumber())
                            .amount(request.getAmount())
                            .receivingAccountNumber(business.getShortCode())
                            .receivingOrganizationId(business.getFastdukaOrgId())
                            .configId(business.getFastdukaConfigId())
                            .transactionNote(request.getTransactionNote())
                            .build();

                    return fastDukaWebClient.post()
                            .uri("/api/transaction/")
                            .header("Authorization", "Api-Key " + business.getFastdukaApiKey())
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(payload)
                            .retrieve()
                            .onStatus(HttpStatusCode::is4xxClientError, response ->
                                    response.bodyToMono(String.class)
                                            .flatMap(body -> Mono.error(new CustomException("FastDuka error: " + body))))
                            .onStatus(HttpStatusCode::is5xxServerError, response ->
                                    Mono.error(new CustomException("FastDuka service unavailable, please try again")))
                            .bodyToMono(FastDukaTransactionResponse.class);
                })
                .map(response -> StkPushInitiateResponse.builder()
                        .idempotencyKey(response.getIdempotencyKey())
                        .transactionStatus(response.getTransactionStatus())
                        .build());
    }

    public Mono<StkPushStatusResponse> getStkPushStatus(String idempotencyKey) {
        log.info("Checking STK push status for key: {}", idempotencyKey);

        return fastDukaWebClient.get()
                .uri("/api/retrieve_transaction_by_idempotency_key/{key}/", idempotencyKey)
                .retrieve()
                .onStatus(status -> status == HttpStatus.NOT_FOUND, response ->
                        Mono.error(new CustomException("Transaction not found for key: " + idempotencyKey)))
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                        Mono.error(new CustomException("FastDuka service unavailable, please try again")))
                .bodyToMono(FastDukaTransactionResponse.class)
                .map(response -> StkPushStatusResponse.builder()
                        .idempotencyKey(response.getIdempotencyKey())
                        .transactionStatus(response.getTransactionStatus())
                        .transactionConfirmationNumber(response.getTransactionConfirmationNumber())
                        .transactionResponseCode(response.getTransactionResponseCode())
                        .build());
    }

    private void validateFastDukaCredentials(Business business) {
        if (business.getFastdukaApiKey() == null || business.getFastdukaApiKey().isBlank()) {
            throw new CustomException("FastDuka API key not configured for this business");
        }
        if (business.getFastdukaOrgId() == null || business.getFastdukaOrgId().isBlank()) {
            throw new CustomException("FastDuka organisation ID not configured for this business");
        }
        if (business.getFastdukaConfigId() == null || business.getFastdukaConfigId().isBlank()) {
            throw new CustomException("FastDuka config ID not configured for this business");
        }
        if (business.getShortCode() == null || business.getShortCode().isBlank()) {
            throw new CustomException("Business Paybill/Till number (shortCode) not configured");
        }
    }
}
