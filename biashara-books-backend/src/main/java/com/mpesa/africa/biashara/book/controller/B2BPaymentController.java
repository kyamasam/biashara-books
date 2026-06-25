package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.MpesaB2BPaymentRequest;
import com.mpesa.africa.biashara.book.model.dto.response.MpesaB2BPaymentResponse;
import com.mpesa.africa.biashara.book.service.B2BPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/b2b")
@RequiredArgsConstructor
public class B2BPaymentController {

    private final B2BPaymentService b2BPaymentService;

    @PostMapping("/pay")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<MpesaB2BPaymentResponse> initiatePaybillPayment(@Valid @RequestBody MpesaB2BPaymentRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("B2B paybill payment from user: {}, destination: {}", userId, request.getDestinationPaybill());
            return b2BPaymentService.initiatePaybillPayment(request, userId);
        });
    }

    @GetMapping("/status")
    public Mono<Map<String, Object>> getPaymentStatus(@RequestParam("conversation_id") String conversationId) {
        return getCurrentUserId().flatMap(userId ->
                b2BPaymentService.getPaymentStatus(conversationId, userId));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
