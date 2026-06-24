package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Business;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface BusinessRepository extends ReactiveCrudRepository<Business, UUID> {

    @Query("SELECT * FROM business WHERE user_id = $1")
    Flux<Business> findByUserId(UUID userId);

    @Query("SELECT * FROM business WHERE user_id = $1 AND name ILIKE CONCAT('%', $2, '%')")
    Flux<Business> findByUserIdAndNameContaining(UUID userId, String name);

    @Query("SELECT COUNT(*) FROM business WHERE user_id = $1")
    Mono<Long> countByUserId(UUID userId);
}
