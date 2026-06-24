package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtTokenProvider;
import com.mpesa.africa.biashara.book.model.dto.request.InventoryRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.service.InventoryService;
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
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Inventory>> createInventory(
            @Valid @RequestBody InventoryRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Creating inventory for user: {}", userId);
        return inventoryService.createInventory(request, userId)
                .map(inventory -> ApiResponse.success(inventory, "Inventory created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Inventory>> getInventoryById(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching inventory: {} for user: {}", id, userId);
        return inventoryService.getInventoryById(id, userId)
                .map(inventory -> ApiResponse.success(inventory, "Inventory retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Inventory>>> getAllInventory(
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching all inventory for user: {}", userId);
        return inventoryService.getAllInventory(userId)
                .collectList()
                .map(inventory -> ApiResponse.success(inventory, "Inventory retrieved successfully"));
    }

    @GetMapping("/product/{productId}")
    public Mono<ApiResponse<List<Inventory>>> getInventoryByProduct(
            @PathVariable UUID productId,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching inventory for product: {} for user: {}", productId, userId);
        return inventoryService.getInventoryByProduct(productId, userId)
                .collectList()
                .map(inventory -> ApiResponse.success(inventory, "Inventory retrieved successfully"));
    }

    @GetMapping("/product/{productId}/total-stock")
    public Mono<ApiResponse<Double>> getTotalStockByProduct(
            @PathVariable UUID productId,
            @RequestHeader("Authorization") String token) {
        log.info("Fetching total stock for product: {}", productId);
        return inventoryService.getTotalStockByProduct(productId)
                .map(stock -> ApiResponse.success(stock, "Total stock retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<Inventory>> updateInventory(
            @PathVariable UUID id,
            @Valid @RequestBody InventoryRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Updating inventory: {} for user: {}", id, userId);
        return inventoryService.updateInventory(id, request, userId)
                .map(inventory -> ApiResponse.success(inventory, "Inventory updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteInventory(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Deleting inventory: {} for user: {}", id, userId);
        return inventoryService.deleteInventory(id, userId)
                .then(Mono.just(ApiResponse.<Void>success(null, "Inventory deleted successfully")));
    }

    private UUID extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return tokenProvider.extractUserId(token);
    }
}