package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Expense;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends ReactiveCrudRepository<Expense, UUID> {

    @Query("SELECT * FROM expenses WHERE user_id = :userId")
    Flux<Expense> findByUserId(UUID userId);

    @Query("SELECT * FROM expenses WHERE business_id = :businessId")
    Flux<Expense> findByBusinessId(UUID businessId);

    @Query("SELECT * FROM expenses WHERE user_id = :userId AND expense_type_id = :expenseTypeId")
    Flux<Expense> findByUserIdAndExpenseTypeId(UUID userId, UUID expenseTypeId);

    @Query("SELECT * FROM expenses WHERE business_id = :businessId AND expense_type_id = :expenseTypeId")
    Flux<Expense> findByBusinessIdAndExpenseTypeId(UUID businessId, UUID expenseTypeId);

    @Query("SELECT SUM(expense_amount) FROM expenses WHERE user_id = :userId")
    Mono<Double> sumExpenseAmountByUserId(UUID userId);

    @Query("SELECT SUM(expense_amount) FROM expenses WHERE business_id = :businessId")
    Mono<Double> sumExpenseAmountByBusinessId(UUID businessId);

    @Query("SELECT COALESCE(SUM(expense_amount), 0) FROM expenses WHERE business_id = :businessId AND expense_status = 'completed'")
    Mono<BigDecimal> sumCompletedExpenseAmountByBusinessId(UUID businessId);

    @Query("SELECT COALESCE(SUM(expense_amount), 0) FROM expenses WHERE business_id = :businessId AND expense_status = 'completed' AND created_at BETWEEN :startDate AND :endDate")
    Mono<BigDecimal> sumCompletedExpenseAmountByBusinessIdAndDateRange(UUID businessId, LocalDateTime startDate, LocalDateTime endDate);
}
