package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtTokenProvider;
import com.mpesa.africa.biashara.book.model.dto.request.StatisticsRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.dto.response.StatisticsResponse;
import com.mpesa.africa.biashara.book.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final JwtTokenProvider tokenProvider;

    @GetMapping
    public Mono<ApiResponse<StatisticsResponse>> getStatistics(
            @RequestParam(required = false, defaultValue = "today") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestHeader("Authorization") String token) {

        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching statistics for user: {} with period: {}", userId, period);

        StatisticsRequest request = StatisticsRequest.builder()
                .period(period)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        return statisticsService.getStatistics(userId, request)
                .map(response -> ApiResponse.success(response, "Statistics retrieved successfully"));
    }

    @PostMapping
    public Mono<ApiResponse<StatisticsResponse>> getStatisticsPost(
            @RequestBody StatisticsRequest request,
            @RequestHeader("Authorization") String token) {

        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching statistics for user: {} with request: {}", userId, request);

        return statisticsService.getStatistics(userId, request)
                .map(response -> ApiResponse.success(response, "Statistics retrieved successfully"));
    }

    @GetMapping("/overview")
    public Mono<ApiResponse<StatisticsResponse>> getDashboardOverview(
            @RequestHeader("Authorization") String token) {

        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching dashboard overview for user: {}", userId);

        // Default to today's statistics
        StatisticsRequest request = StatisticsRequest.builder()
                .period("today")
                .build();

        return statisticsService.getStatistics(userId, request)
                .map(response -> ApiResponse.success(response, "Dashboard overview retrieved successfully"));
    }

    private UUID extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return tokenProvider.extractUserId(token);
    }
}
