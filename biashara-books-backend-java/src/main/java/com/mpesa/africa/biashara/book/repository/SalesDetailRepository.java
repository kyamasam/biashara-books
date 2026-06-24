package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.SalesDetail;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface SalesDetailRepository extends ReactiveCrudRepository<SalesDetail, UUID> {

    @Query("SELECT * FROM sales_details WHERE sale_id = $1")
    Flux<SalesDetail> findBySaleId(UUID saleId);

    @Query("SELECT * FROM sales_details WHERE inventory_id = $1")
    Flux<SalesDetail> findByInventoryId(UUID inventoryId);

    @Query("SELECT SUM(quantity) FROM sales_details WHERE inventory_id = $1")
    Mono<Double> sumQuantityByInventoryId(UUID inventoryId);
}
