package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.ProductRequest;
import com.mpesa.africa.biashara.book.model.dto.response.PageResponse;
import com.mpesa.africa.biashara.book.model.dto.response.ProductResponse;
import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.model.entity.Product;
import com.mpesa.africa.biashara.book.repository.InventoryRepository;
import com.mpesa.africa.biashara.book.repository.ProductRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    public Mono<Product> createProduct(ProductRequest request, UUID userId) {
        log.info("Creating product: {} for user: {}", request.getName(), userId);

        return resolveBusinessId(userId)
                .flatMap(businessId -> {
                    Product product = Product.builder()
                            .name(request.getName())
                            .photoUrl(request.getPhotoUrl())
                            .description(request.getDescription())
                            .productCategoryId(request.getProductCategoryId())
                            .userId(userId)
                            .businessId(businessId)
                            .build();
                    return productRepository.save(product);
                });
    }

    public Mono<Product> getProductById(UUID id, UUID userId) {
        return resolveBusinessId(userId)
                .flatMap(businessId -> productRepository.findById(id)
                        .filter(product -> businessId.equals(product.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Product not found or access denied"))));
    }

    public Mono<PageResponse<ProductResponse>> getAllProducts(UUID userId, int page, int size, String name, UUID categoryId) {
        return resolveBusinessId(userId).flatMap(businessId -> {
            int offset = (page - 1) * size;
            Mono<Long> countMono = productRepository.countByBusinessIdFiltered(businessId, name, categoryId);
            Mono<java.util.List<ProductResponse>> productsMono = productRepository
                    .findByBusinessIdFilteredPaged(businessId, name, categoryId, size, offset)
                    .flatMap(product -> enrichWithInventory(product, userId))
                    .collectList();

            return Mono.zip(productsMono, countMono)
                    .map(tuple -> PageResponse.<ProductResponse>builder()
                            .content(tuple.getT1())
                            .page(page)
                            .size(size)
                            .totalElements(tuple.getT2())
                            .totalPages((int) Math.ceil((double) tuple.getT2() / size))
                            .first(page == 1)
                            .last((long) page * size >= tuple.getT2())
                            .empty(tuple.getT1().isEmpty())
                            .build());
        });
    }

    public Flux<Product> searchProducts(UUID userId, String name) {
        return resolveBusinessId(userId)
                .flatMapMany(businessId -> productRepository.findByBusinessIdAndNameContaining(businessId, name));
    }

    public Mono<Product> updateProduct(UUID id, ProductRequest request, UUID userId) {
        return resolveBusinessId(userId)
                .flatMap(businessId -> productRepository.findById(id)
                        .filter(product -> businessId.equals(product.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Product not found or access denied")))
                        .flatMap(existingProduct -> {
                            existingProduct.setName(request.getName());
                            existingProduct.setPhotoUrl(request.getPhotoUrl());
                            existingProduct.setDescription(request.getDescription());
                            existingProduct.setProductCategoryId(request.getProductCategoryId());
                            return productRepository.save(existingProduct);
                        }));
    }

    public Mono<Void> deleteProduct(UUID id, UUID userId) {
        return resolveBusinessId(userId)
                .flatMap(businessId -> productRepository.findById(id)
                        .filter(product -> businessId.equals(product.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Product not found or access denied")))
                        .flatMap(productRepository::delete));
    }

    private Mono<ProductResponse> enrichWithInventory(Product product, UUID userId) {
        Mono<Double> qty = inventoryRepository.sumQuantityByProductId(product.getId())
                .defaultIfEmpty(0.0);
        Mono<BigDecimal> price = inventoryRepository.maxSalePriceByProductId(product.getId())
                .defaultIfEmpty(BigDecimal.ZERO);
        Mono<List<Inventory>> inventory = inventoryRepository.findByUserIdAndProductId(userId, product.getId())
                .collectList();
        return Mono.zip(qty, price, inventory)
                .map(t -> ProductResponse.from(product, t.getT1(), t.getT2(), t.getT3()));
    }

    private Mono<UUID> resolveBusinessId(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> Mono.justOrEmpty(user.getCurrentBusinessId())
                        .switchIfEmpty(Mono.error(new CustomException("No current business set"))));
    }
}
