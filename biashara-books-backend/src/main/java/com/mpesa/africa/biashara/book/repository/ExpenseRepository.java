package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Expense;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ExpenseRepository extends ReactiveCrudRepository<Expense, UUID> {

    @Query("SELECT * FROM expenses WHERE user_id = $1")
    Flux<Expense> findByUserId(UUID userId);

    @Query("SELECT * FROM expenses WHERE user_id = $1 AND expense_type_id = $2")
    Flux<Expense> findByUserIdAndExpenseTypeId(UUID userId, UUID expenseTypeId);

    @Query("SELECT SUM(expense_amount) FROM expenses WHERE user_id = $1")
    Mono<Double> sumExpenseAmountByUserId(UUID userId);
}