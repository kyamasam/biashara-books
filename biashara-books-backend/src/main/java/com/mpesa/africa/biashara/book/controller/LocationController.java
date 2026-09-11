package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.LocationRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Location;
import com.mpesa.africa.biashara.book.service.BusinessService;
import com.mpesa.africa.biashara.book.service.LocationService;
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
@RequestMapping("/api/businesses/{businessId}/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;
    private final BusinessService businessService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Location>> createLocation(
            @PathVariable UUID businessId,
            @Valid @RequestBody LocationRequest request) {
        return getCurrentUserId()
                .flatMap(userId -> businessService.getBusinessById(businessId, userId))
                .flatMap(business -> locationService.createLocation(request, businessId))
                .map(location -> ApiResponse.success(location, "Location created successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Location>>> getLocations(@PathVariable UUID businessId) {
        return getCurrentUserId()
                .flatMap(userId -> businessService.getBusinessById(businessId, userId))
                .flatMapMany(business -> locationService.getLocationsForBusiness(businessId))
                .collectList()
                .map(locations -> ApiResponse.success(locations, "Locations retrieved successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Location>> getLocationById(
            @PathVariable UUID businessId,
            @PathVariable UUID id) {
        return getCurrentUserId()
                .flatMap(userId -> businessService.getBusinessById(businessId, userId))
                .flatMap(business -> locationService.getLocationById(id, businessId))
                .map(location -> ApiResponse.success(location, "Location retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<Location>> updateLocation(
            @PathVariable UUID businessId,
            @PathVariable UUID id,
            @Valid @RequestBody LocationRequest request) {
        return getCurrentUserId()
                .flatMap(userId -> businessService.getBusinessById(businessId, userId))
                .flatMap(business -> locationService.updateLocation(id, request, businessId))
                .map(location -> ApiResponse.success(location, "Location updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteLocation(
            @PathVariable UUID businessId,
            @PathVariable UUID id) {
        return getCurrentUserId()
                .flatMap(userId -> businessService.getBusinessById(businessId, userId))
                .flatMap(business -> locationService.deleteLocation(id, businessId))
                .then(Mono.just(ApiResponse.<Void>success(null, "Location deleted successfully")));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
