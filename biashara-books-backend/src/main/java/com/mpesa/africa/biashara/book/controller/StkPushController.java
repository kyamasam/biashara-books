package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.StkPushInitiateRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.dto.response.StkPushInitiateResponse;
import com.mpesa.africa.biashara.book.model.dto.response.StkPushStatusResponse;
import com.mpesa.africa.biashara.book.service.StkPushService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/stk-push")
@RequiredArgsConstructor
@Tag(name = "stk-push", description = "FastDuka M-Pesa STK Push operations")
public class StkPushController {

    private final StkPushService stkPushService;

    @PostMapping("/initiate")
    @Operation(summary = "Initiate an STK push to the customer's phone")
    public Mono<ApiResponse<StkPushInitiateResponse>> initiateStkPush(
            @Valid @RequestBody StkPushInitiateRequest request) {
        return getCurrentUserId()
                .flatMap(userId -> {
                    log.info("STK push initiation request from user: {}", userId);
                    return stkPushService.initiateStkPush(request, userId);
                })
                .map(response -> ApiResponse.success(response, "STK push initiated successfully"));
    }

    @GetMapping("/status/{idempotencyKey}")
    @Operation(summary = "Poll the status of an STK push transaction")
    public Mono<ApiResponse<StkPushStatusResponse>> getStkPushStatus(
            @Parameter(description = "Idempotency key returned from the initiate call")
            @PathVariable String idempotencyKey) {
        return getCurrentUserId()
                .flatMap(userId -> {
                    log.info("STK push status check for key: {} by user: {}", idempotencyKey, userId);
                    return stkPushService.getStkPushStatus(idempotencyKey);
                })
                .map(response -> ApiResponse.success(response, "Transaction status retrieved"));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
