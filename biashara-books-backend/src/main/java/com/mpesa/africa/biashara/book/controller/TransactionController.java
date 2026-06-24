package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.TransactionRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.service.TransactionService;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Transaction>> createTransaction(@Valid @RequestBody TransactionRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating transaction for user: {}", userId);
            return transactionService.createTransaction(request, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction created successfully"));
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<Transaction>> getTransactionById(@PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching transaction: {} for user: {}", id, userId);
            return transactionService.getTransactionById(id, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction retrieved successfully"));
    }

    @GetMapping
    public Mono<ApiResponse<List<Transaction>>> getAllTransactions() {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching all transactions for user: {}", userId);
            return transactionService.getAllTransactions(userId).collectList();
        }).map(transactions -> ApiResponse.success(transactions, "Transactions retrieved successfully"));
    }

    @GetMapping("/recent")
    public Mono<ApiResponse<List<Transaction>>> getRecentTransactions(
            @Parameter(description = "Maximum number of recent transactions to return.", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching recent transactions for user: {}", userId);
            return transactionService.getRecentTransactions(userId, limit).collectList();
        }).map(transactions -> ApiResponse.success(transactions, "Recent transactions retrieved successfully"));
    }

    @PatchMapping("/{id}/status")
    public Mono<ApiResponse<Transaction>> updateTransactionStatus(
            @PathVariable UUID id,
            @Parameter(
                    description = """
                            New processing state.
                            Options:
                            - initiated: Transaction has been created and is awaiting confirmation.
                            - success: Transaction completed successfully.
                            - failed: Transaction did not complete successfully.
                            """,
                    example = "success"
            )
            @RequestParam TransactionStatus status,
            @Parameter(description = "Optional human-readable status note or provider failure reason.", example = "M-PESA callback confirmed payment")
            @RequestParam(required = false) String details) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating transaction status: {} for user: {}", id, userId);
            return transactionService.updateTransactionStatus(id, status, details, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction status updated successfully"));
    }

    @PatchMapping("/{id}/callback")
    public Mono<ApiResponse<Transaction>> updateTransactionCallback(
            @PathVariable UUID id,
            @Parameter(description = "External reconciliation or checkout request identifier used to match callbacks.", example = "ws_CO_240620261230001234567890")
            @RequestParam String reconciliationId,
            @RequestBody Object callbackResp) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating transaction callback: {} for user: {}", id, userId);
            return transactionService.updateTransactionCallback(id, reconciliationId, callbackResp, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction callback updated successfully"));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}
