package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.SalesRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Sales;
import com.mpesa.africa.biashara.book.model.entity.SalesDetail;
import com.mpesa.africa.biashara.book.service.SalesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Sales>> createSales(@Valid @RequestBody SalesRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating sales for user: {}", userId);
            return salesService.createSales(request, userId);
        }).map(sales -> ApiResponse.success(sales, "Sales created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Sales>> getSalesById(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching sales: {} for user: {}", id, userId);
            return salesService.getSalesById(id, userId);
        }).map(sales -> ApiResponse.success(sales, "Sales retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Sales>>> getAllSales() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching all sales for user: {}", userId);
            return salesService.getAllSales(userId).collectList();
        }).map(sales -> ApiResponse.success(sales, "Sales retrieved successfully"));
    }

    @GetMapping("/date-range")
    public Mono<ApiResponse<List<Sales>>> getSalesByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching sales by date range for user: {}", userId);
            return salesService.getSalesByDateRange(userId, startDate, endDate).collectList();
        }).map(sales -> ApiResponse.success(sales, "Sales retrieved successfully"));
    }

    @GetMapping("/{saleId}/details")
    public Mono<ApiResponse<List<SalesDetail>>> getSalesDetails(@PathVariable UUID saleId) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching sales details for sale: {} for user: {}", saleId, userId);
            return salesService.getSalesDetails(saleId, userId).collectList();
        }).map(details -> ApiResponse.success(details, "Sales details retrieved successfully"));
    }

    @GetMapping("/total")
    public Mono<ApiResponse<BigDecimal>> getTotalSalesAmount() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching total sales amount for user: {}", userId);
            return salesService.getTotalSalesAmount(userId);
        }).map(total -> ApiResponse.success(total, "Total sales amount retrieved successfully"));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
