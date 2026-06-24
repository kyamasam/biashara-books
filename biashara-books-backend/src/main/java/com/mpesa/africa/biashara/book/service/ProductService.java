package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.ProductRequest;
import com.mpesa.africa.biashara.book.model.entity.Product;
import com.mpesa.africa.biashara.book.repository.ProductRepository;
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

    public Mono<Product> createProduct(ProductRequest request, UUID userId) {
        log.info("Creating product: {} for user: {}", request.getName(), userId);

        Product product = Product.builder()
                .name(request.getName())
                .photoUrl(request.getPhotoUrl())
                .description(request.getDescription())
                .productCategoryId(request.getProductCategoryId())
                .userId(userId)
                .build();

        return productRepository.save(product);
    }

    public Mono<Product> getProductById(UUID id, UUID userId) {
        return productRepository.findById(id)
                .filter(product -> product.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Product not found or access denied")));
    }

    public Flux<Product> getAllProducts(UUID userId) {
        return productRepository.findByUserId(userId);
    }

    public Flux<Product> searchProducts(UUID userId, String name) {
        return productRepository.findByUserIdAndNameContaining(userId, name);
    }

    public Mono<Product> updateProduct(UUID id, ProductRequest request, UUID userId) {
        return productRepository.findById(id)
                .filter(product -> product.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Product not found or access denied")))
                .flatMap(existingProduct -> {
                    existingProduct.setName(request.getName());
                    existingProduct.setPhotoUrl(request.getPhotoUrl());
                    existingProduct.setDescription(request.getDescription());
                    existingProduct.setProductCategoryId(request.getProductCategoryId());
                    return productRepository.save(existingProduct);
                });
    }

    public Mono<Void> deleteProduct(UUID id, UUID userId) {
        return productRepository.findById(id)
                .filter(product -> product.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Product not found or access denied")))
                .flatMap(productRepository::delete);
    }
}
