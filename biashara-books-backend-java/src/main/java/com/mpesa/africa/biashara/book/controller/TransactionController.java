package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtTokenProvider;
import com.mpesa.africa.biashara.book.model.dto.request.TransactionRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.service.TransactionService;
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
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Transaction>> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Creating transaction for user: {}", userId);
        return transactionService.createTransaction(request, userId)
                .map(transaction -> ApiResponse.success(transaction, "Transaction created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Transaction>> getTransactionById(
            @PathVariable UUID id,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching transaction: {} for user: {}", id, userId);
        return transactionService.getTransactionById(id, userId)
                .map(transaction -> ApiResponse.success(transaction, "Transaction retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Transaction>>> getAllTransactions(
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching all transactions for user: {}", userId);
        return transactionService.getAllTransactions(userId)
                .collectList()
                .map(transactions -> ApiResponse.success(transactions, "Transactions retrieved successfully"));
    }

    @GetMapping("/recent")
    public Mono<ApiResponse<List<Transaction>>> getRecentTransactions(
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Fetching recent transactions for user: {}", userId);
        return transactionService.getRecentTransactions(userId, limit)
                .collectList()
                .map(transactions -> ApiResponse.success(transactions, "Recent transactions retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    public Mono<ApiResponse<Transaction>> updateTransactionStatus(
            @PathVariable UUID id,
            @RequestParam TransactionStatus status,
            @RequestParam(required = false) String details,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Updating transaction status: {} for user: {}", id, userId);
        return transactionService.updateTransactionStatus(id, status, details, userId)
                .map(transaction -> ApiResponse.success(transaction, "Transaction status updated successfully"));
    }

    @PatchMapping("/{id}/callback")
    public Mono<ApiResponse<Transaction>> updateTransactionCallback(
            @PathVariable UUID id,
            @RequestParam String reconciliationId,
            @RequestBody Object callbackResp,
            @RequestHeader("Authorization") String token) {
        UUID userId = extractUserIdFromToken(token);
        log.info("Updating transaction callback: {} for user: {}", id, userId);
        return transactionService.updateTransactionCallback(id, reconciliationId, callbackResp, userId)
                .map(transaction -> ApiResponse.success(transaction, "Transaction callback updated successfully"));
    }

    private UUID extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return tokenProvider.extractUserId(token);
    }
}