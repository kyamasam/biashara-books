package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.InventoryRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.service.InventoryService;
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
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Inventory>> createInventory(@Valid @RequestBody InventoryRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating inventory for user: {}", userId);
            return inventoryService.createInventory(request, userId);
        }).map(inventory -> ApiResponse.success(inventory, "Inventory created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Inventory>> getInventoryById(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching inventory: {} for user: {}", id, userId);
            return inventoryService.getInventoryById(id, userId);
        }).map(inventory -> ApiResponse.success(inventory, "Inventory retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Inventory>>> getAllInventory() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching all inventory for user: {}", userId);
            return inventoryService.getAllInventory(userId).collectList();
        }).map(inventory -> ApiResponse.success(inventory, "Inventory retrieved successfully"));
    }

    @GetMapping("/product/{productId}")
    public Mono<ApiResponse<List<Inventory>>> getInventoryByProduct(@PathVariable UUID productId) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching inventory for product: {} for user: {}", productId, userId);
            return inventoryService.getInventoryByProduct(productId, userId).collectList();
        }).map(inventory -> ApiResponse.success(inventory, "Inventory retrieved successfully"));
    }

    @GetMapping("/product/{productId}/total-stock")
    public Mono<ApiResponse<Double>> getTotalStockByProduct(@PathVariable UUID productId) {
        log.info("Fetching total stock for product: {}", productId);
        return inventoryService.getTotalStockByProduct(productId)
                .map(stock -> ApiResponse.success(stock, "Total stock retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<Inventory>> updateInventory(@PathVariable UUID id, @Valid @RequestBody InventoryRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating inventory: {} for user: {}", id, userId);
            return inventoryService.updateInventory(id, request, userId);
        }).map(inventory -> ApiResponse.success(inventory, "Inventory updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteInventory(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Deleting inventory: {} for user: {}", id, userId);
            return inventoryService.deleteInventory(id, userId);
        }).then(Mono.just(ApiResponse.<Void>success(null, "Inventory deleted successfully")));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
