package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.ExpenseRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Expense;
import com.mpesa.africa.biashara.book.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Expense>> createExpense(@Valid @RequestBody ExpenseRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating expense for user: {}", userId);
            return expenseService.createExpense(request, userId);
        }).map(expense -> ApiResponse.success(expense, "Expense created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Expense>> getExpenseById(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching expense: {} for user: {}", id, userId);
            return expenseService.getExpenseById(id, userId);
        }).map(expense -> ApiResponse.success(expense, "Expense retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Expense>>> getAllExpenses() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching all expenses for user: {}", userId);
            return expenseService.getAllExpenses(userId).collectList();
        }).map(expenses -> ApiResponse.success(expenses, "Expenses retrieved successfully"));
    }

    @GetMapping("/type/{expenseTypeId}")
    public Mono<ApiResponse<List<Expense>>> getExpensesByType(@PathVariable UUID expenseTypeId) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching expenses by type: {} for user: {}", expenseTypeId, userId);
            return expenseService.getExpensesByType(expenseTypeId, userId).collectList();
        }).map(expenses -> ApiResponse.success(expenses, "Expenses retrieved successfully"));
    }

    @GetMapping("/total")
    public Mono<ApiResponse<Double>> getTotalExpenses() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching total expenses for user: {}", userId);
            return expenseService.getTotalExpenses(userId);
        }).map(total -> ApiResponse.success(total, "Total expenses retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<Expense>> updateExpense(@PathVariable UUID id, @Valid @RequestBody ExpenseRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating expense: {} for user: {}", id, userId);
            return expenseService.updateExpense(id, request, userId);
        }).map(expense -> ApiResponse.success(expense, "Expense updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteExpense(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Deleting expense: {} for user: {}", id, userId);
            return expenseService.deleteExpense(id, userId);
        }).then(Mono.just(ApiResponse.<Void>success(null, "Expense deleted successfully")));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
