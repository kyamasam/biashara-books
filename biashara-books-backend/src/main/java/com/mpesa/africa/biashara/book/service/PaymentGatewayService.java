// service/PaymentGatewayService.java
package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.config.PaymentGatewayProperties;
import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.payment.InitiatePaymentRequest;
import com.mpesa.africa.biashara.book.model.dto.payment.PaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentGatewayService {

    private final WebClient webClient;
    private final PaymentGatewayProperties properties;

    /**
     * Initiate an STK Push payment
     */
    public Mono<PaymentResponse> initiateStkPush(InitiatePaymentRequest request) {
        log.info("Initiating STK Push for customer: {}", request.getCustomerAccountNumber());

        validatePaymentRequest(request);

        return webClient.post()
                .uri("/transaction/")
                .header(HttpHeaders.AUTHORIZATION, "Api-Key " + properties.getApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .flatMap(error -> Mono.error(new CustomException("Payment initiation failed: " + error))))
                .bodyToMono(PaymentResponse.class)
                .doOnSuccess(response -> log.info("STK Push initiated with idempotency key: {}", response.getIdempotencyKey()))
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                        .filter(throwable -> throwable instanceof CustomException)
                        .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) ->
                                new CustomException("Payment initiation failed after retries: " + retrySignal.failure().getMessage())));
    }

    /**
     * Poll payment status by idempotency key
     */
    public Mono<PaymentResponse> pollPaymentStatus(String idempotencyKey) {
        log.info("Polling payment status for idempotency key: {}", idempotencyKey);

        return webClient.get()
                .uri("/retrieve_transaction_by_idempotency_key/{idempotencyKey}/", idempotencyKey)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .flatMap(error -> {
                                    if (response.statusCode().value() == 404) {
                                        return Mono.error(new CustomException("Transaction not found with idempotency key: " + idempotencyKey));
                                    }
                                    return Mono.error(new CustomException("Status polling failed: " + error));
                                }))
                .bodyToMono(PaymentResponse.class)
                .doOnSuccess(response -> log.info("Payment status: {} for key: {}",
                        response.getTransactionStatus(), idempotencyKey));
    }

    /**
     * Poll until payment reaches a final state or max attempts are exhausted
     */
    public Mono<PaymentResponse> pollUntilFinalStatus(String idempotencyKey) {
        return pollPaymentStatus(idempotencyKey)
                .expand(response -> {
                    if (!response.isInitiated()) {
                        return Mono.empty();
                    }
                    // Wait for next poll interval
                    return Mono.delay(Duration.ofSeconds(properties.getPollIntervalSeconds()))
                            .then(pollPaymentStatus(idempotencyKey));
                })
                .take(properties.getMaxPollAttempts())
                .last()
                .onErrorResume(error -> {
                    log.error("Payment polling failed: {}", error.getMessage());
                    return Mono.just(PaymentResponse.builder()
                            .idempotencyKey(idempotencyKey)
                            .transactionStatus("failed")
                            .transactionResponse(Map.of("error", error.getMessage()))
                            .build());
                });
    }

    private void validatePaymentRequest(InitiatePaymentRequest request) {
        if (request.getCustomerAccountNumber() == null || request.getCustomerAccountNumber().isEmpty()) {
            throw new CustomException("Customer account number is required");
        }

        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new CustomException("Amount must be greater than 0");
        }

        if (request.getAmount() > properties.getMaxAmount()) {
            throw new CustomException("Amount exceeds maximum allowed: " + properties.getMaxAmount());
        }

        if (request.getTransactionNote() == null || request.getTransactionNote().isEmpty()) {
            throw new CustomException("Transaction note is required");
        }

        // Format phone number (ensure it starts with 254)
        String phone = request.getCustomerAccountNumber();
        if (!phone.startsWith("254")) {
            if (phone.startsWith("0")) {
                request.setCustomerAccountNumber("254" + phone.substring(1));
            } else if (phone.startsWith("+254")) {
                request.setCustomerAccountNumber(phone.substring(1));
            }
        }
    }
}