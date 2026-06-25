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

    @Query("SELECT * FROM products WHERE business_id = $1")
    Flux<Product> findByBusinessId(UUID businessId);

    @Query("SELECT * FROM products WHERE product_category_id = $1")
    Flux<Product> findByProductCategoryId(UUID categoryId);

    @Query("SELECT * FROM products WHERE business_id = $1 AND name ILIKE CONCAT('%', $2, '%')")
    Flux<Product> findByBusinessIdAndNameContaining(UUID businessId, String name);

    @Query("SELECT COUNT(*) FROM products WHERE business_id = $1")
    Mono<Long> countByBusinessId(UUID businessId);

    @Query("SELECT EXISTS(SELECT 1 FROM products WHERE business_id = $1 AND name = $2)")
    Mono<Boolean> existsByBusinessIdAndName(UUID businessId, String name);

    @Query("SELECT * FROM products WHERE business_id = $1 AND name = $2")
    Mono<Product> findByBusinessIdAndName(UUID businessId, String name);

    @Query("SELECT * FROM products WHERE business_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3")
    Flux<Product> findByBusinessIdPaged(UUID businessId, int limit, int offset);

    @Query("""
            SELECT * FROM products
            WHERE business_id = $1
              AND ($2::varchar IS NULL OR name ILIKE CONCAT('%', $2, '%'))
              AND ($3::uuid IS NULL OR product_category_id = $3)
            ORDER BY created_at DESC
            LIMIT $4 OFFSET $5
            """)
    Flux<Product> findByBusinessIdFilteredPaged(UUID businessId, String name, UUID categoryId, int limit, int offset);

    @Query("""
            SELECT COUNT(*) FROM products
            WHERE business_id = $1
              AND ($2::varchar IS NULL OR name ILIKE CONCAT('%', $2, '%'))
              AND ($3::uuid IS NULL OR product_category_id = $3)
            """)
    Mono<Long> countByBusinessIdFiltered(UUID businessId, String name, UUID categoryId);
}
