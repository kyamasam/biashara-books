package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.InventoryRequest;
import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.repository.InventoryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public Mono<Inventory> createInventory(InventoryRequest request, UUID userId) {
        log.info("Creating inventory for product: {} for user: {}", request.getProductId(), userId);

        Inventory inventory = Inventory.builder()
                .productId(request.getProductId())
                .quantity(request.getQuantity())
                .inventoryType(request.getInventoryType())
                .unitMetric(request.getUnitMetric())
                .unitPurchasePrice(request.getUnitPurchasePrice())
                .unitSalePrice(request.getUnitSalePrice())
                .priceIncludesTax(request.getPriceIncludesTax() != null ? request.getPriceIncludesTax() : false)
                .userId(userId)
                .build();
        System.out.println(inventory);
        return inventoryRepository.save(inventory);
    }

    public Mono<Inventory> getInventoryById(UUID id, UUID userId) {
        return inventoryRepository.findById(id)
                .filter(inventory -> inventory.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Inventory not found or access denied")));
    }

    public Flux<Inventory> getAllInventory(UUID userId) {
        return inventoryRepository.findByUserId(userId);
    }

    public Flux<Inventory> getInventoryByProduct(UUID productId, UUID userId) {
        return inventoryRepository.findByUserIdAndProductId(userId, productId);
    }

    public Mono<Inventory> updateInventory(UUID id, @Valid InventoryRequest request, UUID userId) {
        return inventoryRepository.findById(id)
                .filter(inventory -> inventory.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Inventory not found or access denied")))
                .flatMap(existingInventory -> {
                    existingInventory.setProductId(request.getProductId());
                    existingInventory.setQuantity(request.getQuantity());
                    existingInventory.setInventoryType(request.getInventoryType());
                    existingInventory.setUnitMetric(request.getUnitMetric());
                    existingInventory.setUnitPurchasePrice(request.getUnitPurchasePrice());
                    existingInventory.setUnitSalePrice(request.getUnitSalePrice());
                    existingInventory.setPriceIncludesTax(request.getPriceIncludesTax() != null ? request.getPriceIncludesTax() : false);
                    return inventoryRepository.save(existingInventory);
                });
    }

    public Mono<Void> deleteInventory(UUID id, UUID userId) {
        return inventoryRepository.findById(id)
                .filter(inventory -> inventory.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Inventory not found or access denied")))
                .flatMap(inventoryRepository::delete);
    }

    public Mono<Double> getTotalStockByProduct(UUID productId) {
        return inventoryRepository.sumQuantityByProductId(productId)
                .defaultIfEmpty(0.0);
    }
}