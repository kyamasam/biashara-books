package com.mpesa.africa.biashara.book.controller;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.payment.PaymentResponse;
import com.mpesa.africa.biashara.book.model.dto.request.TransactionRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.dto.response.PageResponse;
import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.service.PaymentGatewayService;
import com.mpesa.africa.biashara.book.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
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
@Tag(
        name = "Transactions",
        description = "Create, read, and update transaction records for authenticated users."
)
public class TransactionController {

    private final TransactionService transactionService;
    private final PaymentGatewayService paymentGatewayService;

    @Operation(
            summary = "Create a transaction",
            description = """
                    Creates a transaction for the authenticated user.
                    
                    New transactions are created with status `initiated`.
                    If `businessId` is omitted, the authenticated user's current business is used.
                    
                    For STK Push transactions, the payment will be initiated automatically.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Transaction created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Transaction>> createTransaction(@Valid @RequestBody TransactionRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Creating transaction for user: {}", userId);
            return transactionService.createTransaction(request, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction created successfully"));
    }

    @Operation(summary = "Get transaction by ID", description = "Returns a transaction if it belongs to the authenticated user's current business.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transaction retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Transaction not found or access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/{id}")
    public Mono<ApiResponse<Transaction>> getTransactionById(
            @Parameter(description = "Transaction ID.", example = "6b989f89-6f14-4f9d-a6c5-f29d14fb7d4c")
            @PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching transaction: {} for user: {}", id, userId);
            return transactionService.getTransactionById(id, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction retrieved successfully"));
    }

    @Operation(
            summary = "Get paginated transactions",
            description = """
                    Returns transactions for the authenticated user.
                    
                    Pagination:
                    - `page` is zero-based and defaults to `0`.
                    - `size` defaults to `20`.
                    - `size` is clamped to the range `1` to `100`.
                    - Results are sorted by `createdAt` descending.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Paginated transactions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public Mono<ApiResponse<PageResponse<Transaction>>> getAllTransactions(
            @Parameter(description = "Zero-based page number.", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of transactions per page.", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching transactions page: {} size: {} for user: {}", safePage, safeSize, userId);
            return transactionService.getTransactionsPage(userId, PageRequest.of(safePage, safeSize));
        }).map(transactions -> {
            PageResponse<Transaction> pageResponse = PageResponse.from(transactions);
            return ApiResponse.success(pageResponse, "Transactions retrieved successfully");
        });
    }

    @Operation(
            summary = "Get paginated transactions by business",
            description = "Returns transactions for a specific business. Uses the user's current business if not specified."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Paginated transactions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/business")
    public Mono<ApiResponse<PageResponse<Transaction>>> getTransactionsByBusiness(
            @RequestParam(required = false) UUID businessId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching transactions for business: {} for user: {}", businessId, userId);

            if (businessId != null) {
                return transactionService.getTransactionsPageByBusiness(businessId, PageRequest.of(safePage, safeSize));
            }
            return transactionService.getTransactionsPageWithBusiness(userId, PageRequest.of(safePage, safeSize));
        }).map(transactions -> {
            PageResponse<Transaction> pageResponse = PageResponse.from(transactions);
            return ApiResponse.success(pageResponse, "Transactions retrieved successfully");
        });
    }

    @Operation(summary = "Get recent transactions", description = "Returns recent transactions for the authenticated user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Recent transactions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/recent")
    public Mono<ApiResponse<List<Transaction>>> getRecentTransactions(
            @Parameter(description = "Maximum number of recent transactions to return.", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching recent transactions for user: {}", userId);
            return transactionService.getRecentTransactions(userId, limit).collectList();
        }).map(transactions -> ApiResponse.success(transactions, "Recent transactions retrieved successfully"));
    }

    @Operation(summary = "Get transactions by status", description = "Returns transactions filtered by status for the authenticated user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transactions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping("/status/{status}")
    public Mono<ApiResponse<List<Transaction>>> getTransactionsByStatus(
            @Parameter(description = "Transaction status", example = "initiated")
            @PathVariable TransactionStatus status) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching transactions by status: {} for user: {}", status, userId);
            return transactionService.getTransactionsByStatus(userId, status).collectList();
        }).map(transactions -> ApiResponse.success(transactions, "Transactions retrieved successfully"));
    }

    @Operation(
            summary = "Retry STK Push payment",
            description = "Retries a failed or stuck STK Push payment with a new idempotency key"
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "STK Push retry initiated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Transaction not found or cannot be retried"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PostMapping("/{id}/retry")
    public Mono<ApiResponse<Transaction>> retryStkPush(
            @Parameter(description = "Transaction ID")
            @PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Retrying STK Push for transaction: {} for user: {}", id, userId);
            return transactionService.retryStkPush(id, userId);
        }).map(transaction -> ApiResponse.success(transaction, "STK Push retry initiated"));
    }

    @Operation(
            summary = "Check payment status",
            description = "Poll payment status using idempotency key"
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment status retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found")
    })
    @GetMapping("/status/{idempotencyKey}")
    public Mono<ApiResponse<PaymentResponse>> checkPaymentStatus(
            @Parameter(description = "Idempotency key from payment initiation")
            @PathVariable String idempotencyKey) {
        log.info("Checking payment status for idempotency key: {}", idempotencyKey);
        return paymentGatewayService.pollPaymentStatus(idempotencyKey)
                .map(response -> ApiResponse.success(response, "Payment status retrieved"));
    }

    @Operation(
            summary = "Poll payment until final status",
            description = "Polls payment status until it reaches a final state (success/failed) or max attempts are exhausted"
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Final payment status retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found")
    })
    @GetMapping("/status/{idempotencyKey}/poll")
    public Mono<ApiResponse<PaymentResponse>> pollPaymentUntilFinal(
            @Parameter(description = "Idempotency key from payment initiation")
            @PathVariable String idempotencyKey) {
        log.info("Polling payment for idempotency key: {}", idempotencyKey);
        return paymentGatewayService.pollUntilFinalStatus(idempotencyKey)
                .map(response -> ApiResponse.success(response, "Final payment status retrieved"));
    }

    @Operation(
            summary = "Update transaction",
            description = """
                    Updates a transaction in the authenticated user's current business.
                    If `businessId` is omitted, the authenticated user's current business is used.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transaction updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request payload, transaction not found, or access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PutMapping("/{id}")
    public Mono<ApiResponse<Transaction>> updateTransaction(
            @Parameter(description = "Transaction ID.", example = "6b989f89-6f14-4f9d-a6c5-f29d14fb7d4c")
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating transaction: {} for user: {}", id, userId);
            return transactionService.updateTransaction(id, request, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction updated successfully"));
    }

    @Operation(
            summary = "Update transaction status",
            description = """
                    Updates the processing state for a transaction owned by the authenticated user.
                    
                    Status options:
                    - `initiated`: Transaction has been created and is awaiting confirmation.
                    - `success`: Transaction completed successfully.
                    - `failed`: Transaction did not complete successfully.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transaction status updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid status, transaction not found, or access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PatchMapping("/{id}/status")
    public Mono<ApiResponse<Transaction>> updateTransactionStatus(
            @Parameter(description = "Transaction ID.", example = "6b989f89-6f14-4f9d-a6c5-f29d14fb7d4c")
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

    @Operation(
            summary = "Update transaction callback",
            description = "Stores provider callback details and a reconciliation ID against an existing transaction."
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Transaction callback updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Transaction not found or access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @PatchMapping("/{id}/callback")
    public Mono<ApiResponse<Transaction>> updateTransactionCallback(
            @Parameter(description = "Transaction ID.", example = "6b989f89-6f14-4f9d-a6c5-f29d14fb7d4c")
            @PathVariable UUID id,
            @Parameter(description = "External reconciliation or checkout request identifier used to match callbacks.", example = "ws_CO_240620261230001234567890")
            @RequestParam String reconciliationId,
            @RequestBody Object callbackResp) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating transaction callback: {} for user: {}", id, userId);
            return transactionService.updateTransactionCallback(id, reconciliationId, callbackResp, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction callback updated successfully"));
    }

    @Operation(summary = "Delete transaction", description = "Deletes a transaction if it belongs to the authenticated user.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Transaction deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Transaction not found or access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<ApiResponse<Void>> deleteTransaction(
            @Parameter(description = "Transaction ID.", example = "6b989f89-6f14-4f9d-a6c5-f29d14fb7d4c")
            @PathVariable UUID id) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Deleting transaction: {} for user: {}", id, userId);
            return transactionService.deleteTransaction(id, userId);
        }).then(Mono.just(ApiResponse.<Void>success(null, "Transaction deleted successfully")));
    }

    private Mono<UUID> getCurrentUserId() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
                .map(JwtAuthenticationToken::getUserId);
    }
}