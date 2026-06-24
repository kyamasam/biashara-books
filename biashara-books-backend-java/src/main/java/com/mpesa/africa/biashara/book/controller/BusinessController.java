package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtTokenProvider;
import com.mpesa.africa.biashara.book.model.dto.request.BusinessRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.service.BusinessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Business>> createBusiness(
            @Valid @RequestBody BusinessRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Creating business for user: {}", userId);
        return businessService.createBusiness(request, userId)
                .map(business -> ApiResponse.success(business, "Business created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Business>> getBusinessById(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching business: {} for user: {}", id, userId);
        return businessService.getBusinessById(id, userId)
                .map(business -> ApiResponse.success(business, "Business retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Business>>> getAllBusinesses(
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching all businesses for user: {}", userId);
        return businessService.getAllBusinesses(userId)
                .collectList()  // Collect Flux to List
                .map(businesses -> ApiResponse.success(businesses, "Businesses retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<Business>> updateBusiness(
            @PathVariable UUID id,
            @Valid @RequestBody BusinessRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Updating business: {} for user: {}", id, userId);
        return businessService.updateBusiness(id, request, userId)
                .map(business -> ApiResponse.success(business, "Business updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteBusiness(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Deleting business: {} for user: {}", id, userId);
        return businessService.deleteBusiness(id, userId)
                .then(Mono.just(ApiResponse.<Void>success(null, "Business deleted successfully")));
    }

    private UUID extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return tokenProvider.extractUserId(token);
    }
}