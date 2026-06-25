package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.ProductRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.dto.response.PageResponse;
import com.mpesa.africa.biashara.book.model.dto.response.ProductResponse;
import com.mpesa.africa.biashara.book.model.entity.Product;
import com.mpesa.africa.biashara.book.service.ProductService;
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
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Product>> createProduct(@Valid @RequestBody ProductRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating product for user: {}", userId);
            return productService.createProduct(request, userId);
        }).map(product -> ApiResponse.success(product, "Product created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Product>> getProductById(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching product: {} for user: {}", id, userId);
            return productService.getProductById(id, userId);
        }).map(product -> ApiResponse.success(product, "Product retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<PageResponse<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) UUID categoryId) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching products for user: {}, page: {}, size: {}, name: {}, categoryId: {}", userId, page, size, name, categoryId);
            return productService.getAllProducts(userId, page, size, name, categoryId);
        }).map(result -> ApiResponse.success(result, "Products retrieved successfully"));
    }

    @GetMapping("/search")
    public Mono<ApiResponse<List<Product>>> searchProducts(@RequestParam String name) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Searching products with name: {} for user: {}", name, userId);
            return productService.searchProducts(userId, name).collectList();
        }).map(products -> ApiResponse.success(products, "Products retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<Product>> updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating product: {} for user: {}", id, userId);
            return productService.updateProduct(id, request, userId);
        }).map(product -> ApiResponse.success(product, "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Deleting product: {} for user: {}", id, userId);
            return productService.deleteProduct(id, userId);
        }).then(Mono.just(ApiResponse.<Void>success(null, "Product deleted successfully")));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
