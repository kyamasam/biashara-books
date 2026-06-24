package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.BusinessRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.service.BusinessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Business>> createBusiness(@Valid @RequestBody BusinessRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating business for user: {}", userId);
            return businessService.createBusiness(request, userId);
        }).map(business -> ApiResponse.success(business, "Business created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Business>> getBusinessById(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching business: {} for user: {}", id, userId);
            return businessService.getBusinessById(id, userId);
        }).map(business -> ApiResponse.success(business, "Business retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Business>>> getAllBusinesses() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching all businesses for user: {}", userId);
            return businessService.getAllBusinesses(userId).collectList();
        }).map(businesses -> ApiResponse.success(businesses, "Businesses retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<Business>> updateBusiness(@PathVariable UUID id, @Valid @RequestBody BusinessRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating business: {} for user: {}", id, userId);
            return businessService.updateBusiness(id, request, userId);
        }).map(business -> ApiResponse.success(business, "Business updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteBusiness(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Deleting business: {} for user: {}", id, userId);
            return businessService.deleteBusiness(id, userId);
        }).then(Mono.just(ApiResponse.<Void>success(null, "Business deleted successfully")));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
