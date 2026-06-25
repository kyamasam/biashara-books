package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.MpesaB2BPaymentRequest;
import com.mpesa.africa.biashara.book.model.dto.response.MpesaB2BPaymentResponse;
import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class B2BPaymentService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    @Qualifier("fastDukaWebClient")
    private final WebClient fastDukaWebClient;

    public Mono<MpesaB2BPaymentResponse> initiatePaybillPayment(MpesaB2BPaymentRequest request, UUID userId) {
        log.info("Initiating B2B paybill payment for user: {}, destination: {}", userId, request.getDestinationPaybill());

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
                    if (request.getSourceAccountId() == null && business.getFastdukaConfigId() != null) {
                        try {
                            request.setSourceAccountId(Long.parseLong(business.getFastdukaConfigId()));
                        } catch (NumberFormatException e) {
                            log.warn("fastdukaConfigId '{}' is not a valid Long", business.getFastdukaConfigId());
                        }
                    }
                    validateRequest(request);
                    validateCredentials(business);

                    return fastDukaWebClient.post()
                            .uri("/api/mpesa_b2b/")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + business.getFastdukaApiKey())
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(request)
                            .retrieve()
                            .onStatus(HttpStatusCode::is4xxClientError, response ->
                                    response.bodyToMono(String.class)
                                            .flatMap(body -> Mono.error(new CustomException("B2B request failed: " + body))))
                            .onStatus(HttpStatusCode::is5xxServerError, response ->
                                    Mono.error(new CustomException("B2B payment service unavailable, please try again")))
                            .bodyToMono(MpesaB2BPaymentResponse.class);
                });
    }

    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> getPaymentStatus(String conversationId, UUID userId) {
        log.info("Polling B2B payment status for conversation: {}, user: {}", conversationId, userId);

        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> {
                    if (user.getCurrentBusinessId() == null) {
                        return Mono.error(new CustomException("No active business selected"));
                    }
                    return businessRepository.findById(user.getCurrentBusinessId());
                })
                .switchIfEmpty(Mono.error(new CustomException("Business not found")))
                .flatMap(business -> fastDukaWebClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/transactions_v2/")
                                .queryParam("conversation_id", conversationId)
                                .build())
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + business.getFastdukaApiKey())
                        .retrieve()
                        .onStatus(HttpStatusCode::is4xxClientError, response ->
                                response.bodyToMono(String.class)
                                        .flatMap(body -> Mono.error(new CustomException("Status check failed: " + body))))
                        .bodyToMono(Map.class)
                        .map(m -> (Map<String, Object>) m));
    }

    private void validateRequest(MpesaB2BPaymentRequest request) {
        if (request.getSourceAccountId() == null) {
            throw new CustomException("Source account ID is required for M-PESA paybill payment");
        }
        if (request.getDestinationPaybill() == null || request.getDestinationPaybill().isBlank()) {
            throw new CustomException("Destination paybill is required for M-PESA payment");
        }
        if (request.getAccountReference() == null || request.getAccountReference().isBlank()) {
            throw new CustomException("Account reference is required for M-PESA payment");
        }
        if (request.getRemarks() == null || request.getRemarks().isBlank()) {
            throw new CustomException("Remarks are required for M-PESA payment");
        }
    }

    private void validateCredentials(Business business) {
        if (business.getFastdukaApiKey() == null || business.getFastdukaApiKey().isBlank()) {
            throw new CustomException("FastDuka API key not configured for this business");
        }
    }
}
