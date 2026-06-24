package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.ProductRequest;
import com.mpesa.africa.biashara.book.model.entity.Product;
import com.mpesa.africa.biashara.book.repository.ProductRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
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

    public Flux<Product> getAllProducts(UUID userId) {
        return resolveBusinessId(userId)
                .flatMapMany(productRepository::findByBusinessId);
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

    private Mono<UUID> resolveBusinessId(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> Mono.justOrEmpty(user.getCurrentBusinessId())
                        .switchIfEmpty(Mono.error(new CustomException("No current business set"))));
    }
}
