package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Product;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ProductRepository extends ReactiveCrudRepository<Product, UUID> {

    @Query("SELECT * FROM products WHERE user_id = $1")
    Flux<Product> findByUserId(UUID userId);

    @Query("SELECT * FROM products WHERE product_category_id = $1")
    Flux<Product> findByProductCategoryId(UUID categoryId);

    @Query("SELECT * FROM products WHERE user_id = $1 AND name ILIKE CONCAT('%', $2, '%')")
    Flux<Product> findByUserIdAndNameContaining(UUID userId, String name);

    @Query("SELECT COUNT(*) FROM products WHERE user_id = $1")
    Mono<Long> countByUserId(UUID userId);
}