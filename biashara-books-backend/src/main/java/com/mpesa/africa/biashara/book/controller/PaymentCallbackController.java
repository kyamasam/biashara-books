package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment-callbacks")
@RequiredArgsConstructor
public class PaymentCallbackController {

    private final TransactionService transactionService;

    @PostMapping("/fastduka")
    public Mono<ApiResponse<String>> handleFastDukaCallback(@RequestBody Map<String, Object> callbackData) {
        log.info("Received FastDuka callback: {}", callbackData);

        String idempotencyKey = (String) callbackData.get("idempotencyKey");
        if (idempotencyKey == null) {
            log.warn("Callback received without idempotency key");
            return Mono.just(ApiResponse.error("Missing idempotency key"));
        }

        return transactionService.handlePaymentCallback(idempotencyKey, callbackData)
                .map(transaction -> ApiResponse.success("Callback processed successfully",
                        "Transaction " + transaction.getId() + " updated"))
                .onErrorResume(error -> {
                    log.error("Callback processing failed: {}", error.getMessage());
                    return Mono.just(ApiResponse.error("Callback processing failed: " + error.getMessage()));
                });
    }
}