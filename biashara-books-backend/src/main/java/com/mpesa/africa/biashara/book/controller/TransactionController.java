package com.mpesa.africa.biashara.book.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mpesa.africa.biashara.book.config.JwtAuthenticationToken;
import com.mpesa.africa.biashara.book.model.dto.request.TransactionRequest;
import com.mpesa.africa.biashara.book.model.dto.response.ApiResponse;
import com.mpesa.africa.biashara.book.model.dto.response.PageResponse;
import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.service.TransactionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import reactor.core.publisher.Mono;

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

    @Operation(
            summary = "Create a transaction",
            description = """
                    Creates a transaction for the authenticated user.

                    New transactions are created with status `initiated`.
                    If `businessId` is omitted, the authenticated user's current business is used.

                    Required fields:
                    - transactionStatus: `success` , `failed` or `initiated`
                    - transactionType: `credit` or `debit`
                    - transactionMethod: `stk_push`, `b2c`, `c2b`, `b2b`, or `cash`
                    - transactionPurpose: `expense_payment`, `sale_payment`, or `loan_payment`
                    - transactionAmount: positive number greater than zero
                    - paymentChannel: `pochi`, `paybill`, `till`, or `bank_transfer`
                    """,
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Transaction request payload.",
                    content = @Content(
                            schema = @Schema(implementation = TransactionRequest.class),
                            examples = @ExampleObject(
                                    name = "Sale payment via STK push",
                                    value = """
                                            {
                                              "businessId": "2e2fbf66-4f95-4596-ae58-24a8ce0fb79f",
                                              "transactionType": "credit",
                                              "transactionMethod": "stk_push",
                                              "transactionPurpose": "sale_payment",
                                              "transactionPurposeDetail": "Sale of grocery items",
                                              "confirmationCode": "SFT7QWERTY",
                                              "transactionAmount": 1500.00,
                                              "paymentChannel": "till",
                                              "receiverNumber": "254712345678",
                                              "receiverName": "Biashara Shop",
                                              "receiverAccount": "TILL-123456",
                                              "senderNumber": "254798765432",
                                              "senderName": "Kamau Mwangi",
                                              "reconciliationId": "ws_CO_240620261230001234567890",
                                              "callbackResp": {
                                                "provider": "mpesa",
                                                "resultCode": "0",
                                                "resultDescription": "Success"
                                              }
                                            }
                                            """
                            )
                    )
            )
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
                    Returns transactions for the authenticated user's current business.

                    Pagination:
                    - `page` is one-based and defaults to `1`.
                    - `size` defaults to `20`.
                    - `size` is clamped to the range `1` to `100`.
                    - Results are sorted by `createdAt` descending.
                    """
    )
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Paginated transactions retrieved successfully",
                    content = @Content(
                            schema = @Schema(implementation = PageResponse.class),
                            examples = @ExampleObject(
                                    name = "Paginated transactions",
                                    value = """
                                            {
                                              "success": true,
                                              "message": "Transactions retrieved successfully",
                                              "data": {
                                                "content": [
                                                  {
                                                    "id": "6b989f89-6f14-4f9d-a6c5-f29d14fb7d4c",
                                                    "businessId": "2e2fbf66-4f95-4596-ae58-24a8ce0fb79f",
                                                    "transactionType": "credit",
                                                    "transactionMethod": "stk_push",
                                                    "transactionPurpose": "sale_payment",
                                                    "transactionAmount": 1500.00,
                                                    "paymentChannel": "till",
                                                    "transactionStatus": "initiated"
                                                  }
                                                ],
                                                "page": 1,
                                                "size": 20,
                                                "totalElements": 1,
                                                "totalPages": 1,
                                                "first": true,
                                                "last": true,
                                                "empty": false
                                              },
                                              "timestamp": "2026-06-24T19:05:53"
                                            }
                                            """
                            )
                    )
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    @GetMapping
    public Mono<ApiResponse<PageResponse<Transaction>>> getAllTransactions(
            @Parameter(
                    description = "One-based page number. Values below `1` are treated as `1`.",
                    example = "1",
                    schema = @Schema(type = "integer", defaultValue = "1", minimum = "1")
            )
            @RequestParam(defaultValue = "1") int page,
            @Parameter(
                    description = "Number of transactions per page. Values below `1` become `1`; values above `100` become `100`.",
                    example = "20",
                    schema = @Schema(type = "integer", defaultValue = "20", minimum = "1", maximum = "100")
            )
            @RequestParam(defaultValue = "20") int size) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(size, 1), 100);
        return getCurrentUserId().flatMap(userId -> {
            log.info("Fetching transactions page: {} size: {} for user: {}", safePage, safeSize, userId);
            return transactionService.getTransactionsPage(userId, PageRequest.of(safePage - 1, safeSize));
        }).map(transactions -> ApiResponse.success(PageResponse.from(transactions), "Transactions retrieved successfully"));
    }

    @Operation(summary = "Get recent transactions", description = "Returns recent transactions for the authenticated user's current business. The `limit` query parameter defaults to `10`.")
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
                    example = "success",
                    schema = @Schema(allowableValues = {"initiated", "success", "failed"})
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
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    description = "Raw callback response from the payment provider.",
                    content = @Content(
                            examples = @ExampleObject(
                                    name = "M-PESA callback",
                                    value = """
                                            {
                                              "provider": "mpesa",
                                              "merchantRequestId": "29115-34620561-1",
                                              "checkoutRequestId": "ws_CO_240620261230001234567890",
                                              "resultCode": "0",
                                              "resultDescription": "The service request is processed successfully."
                                            }
                                            """
                            )
                    )
            )
            @RequestBody Object callbackResp) {
        return getCurrentUserId().flatMap(userId -> {
            log.info("Updating transaction callback: {} for user: {}", id, userId);
            return transactionService.updateTransactionCallback(id, reconciliationId, callbackResp, userId);
        }).map(transaction -> ApiResponse.success(transaction, "Transaction callback updated successfully"));
    }

    @Operation(summary = "Delete transaction", description = "Deletes a transaction if it belongs to the authenticated user's current business.")
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
