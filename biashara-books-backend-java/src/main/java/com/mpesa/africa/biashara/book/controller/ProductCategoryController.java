package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.model.dto.request.ProductCategoryRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.ProductCategory;
import com.mpesa.africa.biashara.book.service.ProductCategoryService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<ProductCategory>> createCategory(
            @Valid @RequestBody ProductCategoryRequest request) {
        log.info("Creating product category: {}", request.getName());
        return categoryService.createCategory(request)
                .map(category -> ApiResponse.success(category, "Category created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<ProductCategory>> getCategoryById(@PathVariable UUID id) {
        log.info("Fetching category: {}", id);
        return categoryService.getCategoryById(id)
                .map(category -> ApiResponse.success(category, "Category retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<ProductCategory>>> getAllCategories() {
        log.info("Fetching all categories");
        return categoryService.getAllCategories()
                .collectList()  // Collect Flux to List
                .map(categories -> ApiResponse.success(categories, "Categories retrieved successfully"));
    }

    @GetMapping("/search")
    public Mono<ApiResponse<List<ProductCategory>>> searchCategories(@RequestParam String name) {
        log.info("Searching categories with name: {}", name);
        return categoryService.searchCategories(name)
                .collectList()  // Collect Flux to List
                .map(categories -> ApiResponse.success(categories, "Categories retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<ProductCategory>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody ProductCategoryRequest request) {
        log.info("Updating category: {}", id);
        return categoryService.updateCategory(id, request)
                .map(category -> ApiResponse.success(category, "Category updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        log.info("Deleting category: {}", id);
        return categoryService.deleteCategory(id)
                .then(Mono.just(ApiResponse.<Void>success(null, "Category deleted successfully")));
    }
}