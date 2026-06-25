package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Sales;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface SalesRepository extends ReactiveCrudRepository<Sales, UUID> {

    @Query("SELECT * FROM sales WHERE user_id = $1")
    Flux<Sales> findByUserId(UUID userId);

    @Query("SELECT * FROM sales WHERE user_id = $1 AND created_at BETWEEN $2 AND $3")
    Flux<Sales> findByUserIdAndDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT SUM(total) FROM sales WHERE user_id = $1")
    Mono<Double> sumTotalByUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(total), 0) FROM sales WHERE user_id = $1 AND sale_status = 'completed'")
    Mono<BigDecimal> sumCompletedTotalByUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(total), 0) FROM sales WHERE user_id = $1 AND sale_status = 'completed' AND created_at BETWEEN $2 AND $3")
    Mono<BigDecimal> sumCompletedTotalByUserIdAndDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate);
}
