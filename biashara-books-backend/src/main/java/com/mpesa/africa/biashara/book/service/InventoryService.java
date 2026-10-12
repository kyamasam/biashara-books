package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.InventoryRequest;
import com.mpesa.africa.biashara.book.model.dto.response.InventoryWithProductResponse;
import com.mpesa.africa.biashara.book.model.dto.response.ProductInventoryResponse;
import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.model.entity.Product;
import com.mpesa.africa.biashara.book.model.enums.InventoryCategory;
import com.mpesa.africa.biashara.book.repository.InventoryRepository;
import com.mpesa.africa.biashara.book.repository.ProductRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public Mono<Inventory> createInventory(InventoryRequest request, UUID userId) {
        log.info("Creating inventory for product: {} for user: {}", request.getProductId(), userId);

        return productRepository.findById(request.getProductId())
                .switchIfEmpty(Mono.error(new CustomException("Product not found")))
                .flatMap(product -> {
                    boolean isPhysical = product.getInventoryCategory() == InventoryCategory.physical;
                    if (isPhysical && request.getQuantity() == null) {
                        return Mono.error(new CustomException("Quantity is required for physical inventory"));
                    }
                    return resolveBusinessId(userId)
                            .flatMap(businessId -> {
                                Inventory inventory = Inventory.builder()
                                        .productId(request.getProductId())
                                        .quantity(isPhysical ? request.getQuantity() : null)
                                        .unitPurchasePrice(request.getUnitPurchasePrice())
                                        .unitSalePrice(request.getUnitSalePrice())
                                        .priceIncludesTax(request.getPriceIncludesTax() != null ? request.getPriceIncludesTax() : false)
                                        .userId(userId)
                                        .businessId(businessId)
                                        .locationId(request.getLocationId())
                                        .build();
                                return inventoryRepository.save(inventory);
                            });
                });
    }

    public Mono<InventoryWithProductResponse> getInventoryById(UUID id, UUID userId) {
        return inventoryRepository.findById(id)
                .filter(inventory -> inventory.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Inventory not found or access denied")))
                .flatMap(this::enrichWithProduct);
    }

    public Flux<ProductInventoryResponse> getAllInventory(UUID userId, String productName, Boolean inStock) {
        return resolveBusinessId(userId)
                .flatMapMany(inventoryRepository::findByBusinessId)
                .collectList()
                .flatMapMany(all -> {
                    Map<UUID, List<Inventory>> grouped = all.stream()
                            .collect(Collectors.groupingBy(Inventory::getProductId));
                    return Flux.fromIterable(grouped.entrySet())
                            .flatMap(e -> productRepository.findById(e.getKey())
                                    .map(p -> buildProductInventoryResponse(p, e.getValue()))
                                    .defaultIfEmpty(buildOrphanResponse(e.getKey(), e.getValue()))
                            );
                })
                .filter(r -> productName == null || r.getName().toLowerCase().contains(productName.toLowerCase()))
                .filter(r -> inStock == null || r.getInStock().equals(inStock));
    }

    public Flux<InventoryWithProductResponse> getInventoryByProduct(UUID productId, UUID userId) {
        return inventoryRepository.findByUserIdAndProductId(userId, productId)
                .flatMap(this::enrichWithProduct);
    }

    private ProductInventoryResponse buildProductInventoryResponse(Product product, List<Inventory> inventories) {
        boolean isPhysical = product.getInventoryCategory() == InventoryCategory.physical;
        double total = inventories.stream()
                .filter(i -> isPhysical && i.getQuantity() != null)
                .mapToDouble(Inventory::getQuantity)
                .sum();
        return ProductInventoryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .photoUrl(product.getPhotoUrl())
                .description(product.getDescription())
                .productCategoryId(product.getProductCategoryId())
                .businessId(product.getBusinessId())
                .userId(product.getUserId())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .inventoryType(product.getInventoryType())
                .inventoryCategory(product.getInventoryCategory())
                .unitMetric(product.getUnitMetric())
                .inventories(inventories)
                .totalQuantity(total)
                .inStock(total > 0)
                .build();
    }

    private ProductInventoryResponse buildOrphanResponse(UUID productId, List<Inventory> inventories) {
        double total = inventories.stream()
                .filter(i -> i.getQuantity() != null)
                .mapToDouble(Inventory::getQuantity)
                .sum();
        return ProductInventoryResponse.builder()
                .id(productId)
                .name(productId.toString())
                .inventories(inventories)
                .totalQuantity(total)
                .inStock(total > 0)
                .build();
    }

    private Mono<InventoryWithProductResponse> enrichWithProduct(Inventory inventory) {
        return productRepository.findById(inventory.getProductId())
                .map(product -> InventoryWithProductResponse.builder()
                        .inventory(inventory)
                        .product(product)
                        .build())
                .defaultIfEmpty(InventoryWithProductResponse.builder()
                        .inventory(inventory)
                        .product(null)
                        .build());
    }

    public Mono<Inventory> updateInventory(UUID id, @Valid InventoryRequest request, UUID userId) {
        return productRepository.findById(request.getProductId())
                .switchIfEmpty(Mono.error(new CustomException("Product not found")))
                .flatMap(product -> {
                    boolean isPhysical = product.getInventoryCategory() == InventoryCategory.physical;
                    if (isPhysical && request.getQuantity() == null) {
                        return Mono.error(new CustomException("Quantity is required for physical inventory"));
                    }
                    return inventoryRepository.findById(id)
                            .filter(inventory -> inventory.getUserId().equals(userId))
                            .switchIfEmpty(Mono.error(new CustomException("Inventory not found or access denied")))
                            .flatMap(existingInventory -> {
                                existingInventory.setProductId(request.getProductId());
                                existingInventory.setQuantity(isPhysical ? request.getQuantity() : null);
                                existingInventory.setUnitPurchasePrice(request.getUnitPurchasePrice());
                                existingInventory.setUnitSalePrice(request.getUnitSalePrice());
                                existingInventory.setPriceIncludesTax(request.getPriceIncludesTax() != null ? request.getPriceIncludesTax() : false);
                                existingInventory.setLocationId(request.getLocationId());
                                return inventoryRepository.save(existingInventory);
                            });
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

    private Mono<UUID> resolveBusinessId(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> Mono.justOrEmpty(user.getCurrentBusinessId())
                        .switchIfEmpty(Mono.error(new CustomException("No current business set"))));
    }
}
