package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.ExpenseRequest;
import com.mpesa.africa.biashara.book.model.entity.Expense;
import com.mpesa.africa.biashara.book.repository.ExpenseRepository;
import com.mpesa.africa.biashara.book.repository.ExpenseTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseTypeRepository expenseTypeRepository;

    public Mono<Expense> createExpense(ExpenseRequest request, UUID userId) {
        log.info("Creating expense for user: {}", userId);

        return expenseTypeRepository.findById(request.getExpenseTypeId())
                .switchIfEmpty(Mono.error(new CustomException("Expense type not found")))
                .flatMap(expenseType -> {
                    Expense expense = Expense.builder()
                            .expenseTypeId(request.getExpenseTypeId())
                            .otherName(request.getOtherName())
                            .expenseAmount(request.getExpenseAmount())
                            .transactionId(request.getTransactionId())
                            .userId(userId)
                            .build();
                    return expenseRepository.save(expense);
                });
    }

    public Mono<Expense> getExpenseById(UUID id, UUID userId) {
        return expenseRepository.findById(id)
                .filter(expense -> expense.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Expense not found or access denied")));
    }

    public Flux<Expense> getAllExpenses(UUID userId) {
        return expenseRepository.findByUserId(userId);
    }

    public Flux<Expense> getExpensesByType(UUID expenseTypeId, UUID userId) {
        return expenseRepository.findByUserIdAndExpenseTypeId(userId, expenseTypeId);
    }

    public Mono<Expense> updateExpense(UUID id, ExpenseRequest request, UUID userId) {
        return expenseRepository.findById(id)
                .filter(expense -> expense.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Expense not found or access denied")))
                .flatMap(existingExpense -> {
                    existingExpense.setExpenseTypeId(request.getExpenseTypeId());
                    existingExpense.setOtherName(request.getOtherName());
                    existingExpense.setExpenseAmount(request.getExpenseAmount());
                    existingExpense.setTransactionId(request.getTransactionId());
                    return expenseRepository.save(existingExpense);
                });
    }

    public Mono<Void> deleteExpense(UUID id, UUID userId) {
        return expenseRepository.findById(id)
                .filter(expense -> expense.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Expense not found or access denied")))
                .flatMap(expenseRepository::delete);
    }

    public Mono<Double> getTotalExpenses(UUID userId) {
        return expenseRepository.sumExpenseAmountByUserId(userId)
                .defaultIfEmpty(0.0);
    }
}