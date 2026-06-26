package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface TransactionRepository extends ReactiveCrudRepository<Transaction, UUID> {

    @Query("SELECT * FROM transaction WHERE user_id = $1")
    Flux<Transaction> findByUserId(UUID userId);

    @Query("SELECT * FROM transaction WHERE business_id = $1")
    Flux<Transaction> findByBusinessId(UUID businessId);

    @Query("SELECT * FROM transaction WHERE business_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3")
    Flux<Transaction> findByBusinessId(UUID businessId, int limit, long offset);

    @Query("SELECT COUNT(*) FROM transaction WHERE business_id = $1")
    Mono<Long> countByBusinessId(UUID businessId);

    @Query("SELECT * FROM transaction WHERE transaction_status = $1")
    Flux<Transaction> findByStatus(TransactionStatus status);

    @Query("SELECT * FROM transaction WHERE business_id = $1 AND transaction_status = $2")
    Flux<Transaction> findByBusinessIdAndStatus(UUID businessId, TransactionStatus status);

    @Query("SELECT * FROM transaction WHERE reconciliation_id = $1")
    Mono<Transaction> findByReconciliationId(String reconciliationId);

    @Query("SELECT * FROM transaction WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2")
    Flux<Transaction> findRecentByUserId(UUID userId, int limit);

    @Query("SELECT * FROM transaction WHERE business_id = $1 ORDER BY created_at DESC LIMIT $2")
    Flux<Transaction> findRecentByBusinessId(UUID businessId, int limit);

    @Query("""
            SELECT COALESCE(SUM(
                CASE
                    WHEN transaction_method = 'cash' THEN transaction_amount * 0.25
                    ELSE transaction_amount
                END
            ), 0)
            FROM transaction
            WHERE business_id = $1 AND transaction_status = 'success'
            """)
    Mono<BigDecimal> sumCompletedAmountByBusinessId(UUID businessId);

    @Query("""
            SELECT COALESCE(SUM(
                CASE
                    WHEN transaction_method = 'cash' THEN transaction_amount * 0.25
                    ELSE transaction_amount
                END
            ), 0)
            FROM transaction
            WHERE business_id = $1
              AND transaction_status = 'success'
              AND created_at BETWEEN $2 AND $3
            """)
    Mono<BigDecimal> sumCompletedAmountByBusinessIdAndDateRange(UUID businessId, LocalDateTime startDate, LocalDateTime endDate);
}
