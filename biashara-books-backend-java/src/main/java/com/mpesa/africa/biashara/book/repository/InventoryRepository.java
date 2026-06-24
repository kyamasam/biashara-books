package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Inventory;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface InventoryRepository extends ReactiveCrudRepository<Inventory, UUID> {

    @Query("SELECT * FROM inventory WHERE user_id = $1")
    Flux<Inventory> findByUserId(UUID userId);

    @Query("SELECT * FROM inventory WHERE product_id = $1")
    Flux<Inventory> findByProductId(UUID productId);

    @Query("SELECT * FROM inventory WHERE user_id = $1 AND product_id = $2")
    Flux<Inventory> findByUserIdAndProductId(UUID userId, UUID productId);

    @Query("SELECT SUM(quantity) FROM inventory WHERE product_id = $1")
    Mono<Double> sumQuantityByProductId(UUID productId);
}
