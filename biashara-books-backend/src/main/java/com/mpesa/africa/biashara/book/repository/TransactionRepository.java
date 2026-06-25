package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface TransactionRepository extends ReactiveCrudRepository<Transaction, UUID> {

    @Query("SELECT * FROM transaction WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2")
    Flux<Transaction> findRecentByUserId(UUID userId, int limit);

    @Query("SELECT * FROM transaction WHERE user_id = $1 AND id = $2")
    Mono<Transaction> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT * FROM transaction WHERE business_id = $1 AND created_at BETWEEN $2 AND $3")
    Flux<Transaction> findByBusinessIdAndDateRange(UUID businessId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT * FROM transaction WHERE user_id = $1 AND transaction_status = $2")
    Flux<Transaction> findByUserIdAndStatus(UUID userId, TransactionStatus status);

    @Query("SELECT * FROM transaction WHERE confirmation_code = $1")
    Mono<Transaction> findByConfirmationCode(String confirmationCode);

    @Query("SELECT * FROM transaction WHERE reconciliation_id = $1")
    Mono<Transaction> findByReconciliationId(String reconciliationId);

    @Query("SELECT * FROM transaction WHERE user_id = $1 AND transaction_method = 'stk_push' AND transaction_status = 'initiated' AND created_at < $2")
    Flux<Transaction> findPendingStkPushTransactions(UUID userId, LocalDateTime beforeDate);

    // Paginated queries - Return Flux, not Page
    @Query("SELECT * FROM transaction WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3")
    Flux<Transaction> findByUserIdPaginated(UUID userId, int limit, long offset);

    @Query("SELECT * FROM transaction WHERE business_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3")
    Flux<Transaction> findByBusinessIdPaginated(UUID businessId, int limit, long offset);

    @Query("SELECT * FROM transaction WHERE user_id = $1 ORDER BY created_at DESC")
    Flux<Transaction> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT * FROM transaction WHERE business_id = $1 ORDER BY created_at DESC")
    Flux<Transaction> findByBusinessId(UUID businessId, Pageable pageable);

    // Count queries
    @Query("SELECT COUNT(*) FROM transaction WHERE user_id = $1")
    Mono<Long> countByUserId(UUID userId);

    @Query("SELECT COUNT(*) FROM transaction WHERE business_id = $1")
    Mono<Long> countByBusinessId(UUID businessId);
}