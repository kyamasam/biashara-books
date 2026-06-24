package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface TransactionRepository extends ReactiveCrudRepository<Transaction, UUID> {

    @Query("SELECT * FROM transaction WHERE user_id = $1")
    Flux<Transaction> findByUserId(UUID userId);

    @Query("SELECT * FROM transaction WHERE transaction_status = $1")
    Flux<Transaction> findByStatus(TransactionStatus status);

    @Query("SELECT * FROM transaction WHERE reconciliation_id = $1")
    Mono<Transaction> findByReconciliationId(String reconciliationId);

    @Query("SELECT * FROM transaction WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2")
    Flux<Transaction> findRecentByUserId(UUID userId, int limit);
}