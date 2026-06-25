package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.dto.response.BusinessScoreResponse;
import com.mpesa.africa.biashara.book.service.BusinessScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/business-score")
@RequiredArgsConstructor
@Tag(name = "business-score", description = "Business health score and loan limit calculation")
public class BusinessScoreController {

    private final BusinessScoreService businessScoreService;

    @GetMapping
    @Operation(
            summary = "Calculate business score and loan limit",
            description = "Computes a weighted score (0–100) from sales, transactions, expenses, " +
                    "and outstanding loans, then derives a suggested loan limit. " +
                    "The period parameter controls how many months of history are used."
    )
    public Mono<ApiResponse<BusinessScoreResponse>> getBusinessScore(
            @Parameter(description = "Number of months of history to include (default 1, max 12)")
            @RequestParam(defaultValue = "1") int months) {

        int clampedMonths = Math.max(1, Math.min(months, 12));

        return getCurrentUserId()
                .flatMap(userId -> {
                    log.info("Calculating business score for user: {} over {} month(s)", userId, clampedMonths);
                    return businessScoreService.calculateScore(userId, clampedMonths);
                })
                .map(score -> ApiResponse.success(score, "Business score calculated successfully"));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
