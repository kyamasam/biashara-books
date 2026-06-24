package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.ProductCategoryRequest;
import com.mpesa.africa.biashara.book.model.entity.ProductCategory;
import com.mpesa.africa.biashara.book.repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductCategoryService {

    private final ProductCategoryRepository productCategoryRepository;

    public Mono<ProductCategory> createCategory(ProductCategoryRequest request) {
        log.info("Creating product category: {}", request.getName());

        return productCategoryRepository.existsByName(request.getName())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new CustomException("Category with this name already exists"));
                    }
                    ProductCategory category = ProductCategory.builder()
                            .name(request.getName())
                            .build();
                    return productCategoryRepository.save(category);
                });
    }

    public Mono<ProductCategory> getCategoryById(UUID id) {
        return productCategoryRepository.findById(id)
                .switchIfEmpty(Mono.error(new CustomException("Category not found")));
    }

    public Flux<ProductCategory> getAllCategories() {
        return productCategoryRepository.findAll();
    }

    public Flux<ProductCategory> searchCategories(String name) {
        return productCategoryRepository.findByNameContaining(name);
    }

    public Mono<ProductCategory> updateCategory(UUID id, ProductCategoryRequest request) {
        return productCategoryRepository.findById(id)
                .switchIfEmpty(Mono.error(new CustomException("Category not found")))
                .flatMap(existingCategory -> {
                    existingCategory.setName(request.getName());
                    return productCategoryRepository.save(existingCategory);
                });
    }

    public Mono<Void> deleteCategory(UUID id) {
        return productCategoryRepository.findById(id)
                .switchIfEmpty(Mono.error(new CustomException("Category not found")))
                .flatMap(productCategoryRepository::delete);
    }
}