package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.ProductCategory;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ProductCategoryRepository extends ReactiveCrudRepository<ProductCategory, UUID> {

    @Query("SELECT * FROM product_categories WHERE name ILIKE CONCAT('%', $1, '%')")
    Flux<ProductCategory> findByNameContaining(String name);

    @Query("SELECT * FROM product_categories WHERE LOWER(name) = LOWER($1) LIMIT 1")
    Mono<ProductCategory> findByName(String name);

    @Query("SELECT EXISTS(SELECT 1 FROM product_categories WHERE name = $1)")
    Mono<Boolean> existsByName(String name);
}
