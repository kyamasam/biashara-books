package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtTokenProvider;
import com.mpesa.africa.biashara.book.model.dto.request.ExpenseRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Expense;
import com.mpesa.africa.biashara.book.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
    private final JwtTokenProvider tokenProvider;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Expense>> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Creating expense for user: {}", userId);
        return expenseService.createExpense(request, userId)
                .map(expense -> ApiResponse.success(expense, "Expense created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Expense>> getExpenseById(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching expense: {} for user: {}", id, userId);
        return expenseService.getExpenseById(id, userId)
                .map(expense -> ApiResponse.success(expense, "Expense retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Expense>>> getAllExpenses(
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching all expenses for user: {}", userId);
        return expenseService.getAllExpenses(userId)
                .collectList()
                .map(expenses -> ApiResponse.success(expenses, "Expenses retrieved successfully"));
    }

    @GetMapping("/type/{expenseTypeId}")
    public Mono<ApiResponse<List<Expense>>> getExpensesByType(
            @PathVariable UUID expenseTypeId,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching expenses by type: {} for user: {}", expenseTypeId, userId);
        return expenseService.getExpensesByType(expenseTypeId, userId)
                .collectList()
                .map(expenses -> ApiResponse.success(expenses, "Expenses retrieved successfully"));
    }

    @GetMapping("/total")
    public Mono<ApiResponse<Double>> getTotalExpenses(
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching total expenses for user: {}", userId);
        return expenseService.getTotalExpenses(userId)
                .map(total -> ApiResponse.success(total, "Total expenses retrieved successfully"));
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<Expense>> updateExpense(
            @PathVariable UUID id,
            @Valid @RequestBody ExpenseRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Updating expense: {} for user: {}", id, userId);
        return expenseService.updateExpense(id, request, userId)
                .map(expense -> ApiResponse.success(expense, "Expense updated successfully"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteExpense(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Deleting expense: {} for user: {}", id, userId);
        return expenseService.deleteExpense(id, userId)
                .then(Mono.just(ApiResponse.<Void>success(null, "Expense deleted successfully")));
    }

    private UUID extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return tokenProvider.extractUserId(token);
    }
}