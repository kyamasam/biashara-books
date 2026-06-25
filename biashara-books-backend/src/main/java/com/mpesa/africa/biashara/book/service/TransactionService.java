package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.config.PaymentGatewayProperties;
import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.payment.InitiatePaymentRequest;
import com.mpesa.africa.biashara.book.model.dto.payment.PaymentResponse;
import com.mpesa.africa.biashara.book.model.dto.request.TransactionRequest;
import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionMethod;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final PaymentGatewayService paymentGatewayService;
    private final PaymentGatewayProperties paymentProperties;

    // ==================== CREATE TRANSACTION ====================

    @Transactional
    public Mono<Transaction> createTransaction(TransactionRequest request, UUID userId) {
        log.info("Creating transaction for user: {}", userId);

        return resolveBusinessId(request, userId)
                .flatMap(businessId -> {
                    Transaction transaction = buildTransaction(request, businessId, userId);

                    // If payment method is STK Push, initiate payment
                    if (request.getTransactionMethod() == TransactionMethod.stk_push) {
                        return processStkPushTransaction(transaction, request);
                    }

                    return transactionRepository.save(transaction);
                });
    }

    // ==================== STK PUSH PROCESSING ====================

    @Transactional
    public Mono<Transaction> processStkPushTransaction(Transaction transaction, TransactionRequest request) {
        log.info("Processing STK Push transaction with idempotency: {}", transaction.getId());

        return initiateStkPush(transaction, request)
                .flatMap(paymentResponse -> {
                    // Update transaction with payment details
                    transaction.setTransactionStatus(TransactionStatus.initiated.name());
                    transaction.setConfirmationCode(paymentResponse.getIdempotencyKey());
                    transaction.setTransactionStatusDetails("STK Push initiated. Awaiting customer approval.");
                    transaction.setCallbackResp(Map.of(
                            "idempotencyKey", paymentResponse.getIdempotencyKey(),
                            "paymentResponse", paymentResponse
                    ));

                    return transactionRepository.save(transaction)
                            .flatMap(savedTransaction ->
                                    pollPaymentStatus(savedTransaction)
                            );
                })
                .onErrorResume(error -> {
                    log.error("STK Push processing failed: {}", error.getMessage());
                    transaction.setTransactionStatus(TransactionStatus.failed.name());
                    transaction.setTransactionStatusDetails("Payment initiation failed: " + error.getMessage());
                    return transactionRepository.save(transaction);
                });
    }

    private Mono<PaymentResponse> initiateStkPush(Transaction transaction, TransactionRequest request) {
        InitiatePaymentRequest paymentRequest = InitiatePaymentRequest.builder()
                .customerAccountNumber(request.getSenderNumber())
                .amount(request.getTransactionAmount().doubleValue())
                .receivingAccountNumber(paymentProperties.getPaybill())
                .receivingOrganizationId(paymentProperties.getOrgId())
                .configId(paymentProperties.getConfigId())
                .transactionNote(request.getTransactionPurposeDetail() != null ?
                        request.getTransactionPurposeDetail() :
                        "Payment for " + request.getTransactionPurpose())
                .build();

        return paymentGatewayService.initiateStkPush(paymentRequest);
    }

    private Mono<Transaction> pollPaymentStatus(Transaction transaction) {
        String idempotencyKey = transaction.getConfirmationCode();

        return paymentGatewayService.pollUntilFinalStatus(idempotencyKey)
                .map(paymentResponse -> {
                    if (paymentResponse.isSuccess()) {
                        transaction.setTransactionStatus(TransactionStatus.success.name());
                        transaction.setTransactionConfirmationNumber(paymentResponse.getTransactionConfirmationNumber());
                        transaction.setTransactionStatusDetails("Payment completed successfully");
                    } else if (paymentResponse.isFailed()) {
                        transaction.setTransactionStatus(TransactionStatus.failed.name());
                        transaction.setTransactionStatusDetails("Payment failed or was cancelled");
                    } else {
                        transaction.setTransactionStatus(TransactionStatus.initiated.name());
                        transaction.setTransactionStatusDetails("Payment still pending");
                    }

                    // Update callback response
                    if (paymentResponse.getTransactionResponse() != null) {
                        transaction.setCallbackResp(paymentResponse.getTransactionResponse());
                    }

                    return transaction;
                })
                .flatMap(transactionRepository::save);
    }

    // ==================== RETRY STK PUSH ====================

    public Mono<Transaction> retryStkPush(UUID transactionId, UUID userId) {
        log.info("Retrying STK Push for transaction: {}", transactionId);

        return transactionRepository.findByIdAndUserId(transactionId, userId)
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                .filter(tx -> tx.getTransactionMethod() == TransactionMethod.stk_push.name())
                .switchIfEmpty(Mono.error(new CustomException("Transaction is not an STK Push transaction")))
                .filter(tx -> tx.getTransactionStatus() == TransactionStatus.failed.name() ||
                        tx.getTransactionStatus() == TransactionStatus.initiated.name())
                .switchIfEmpty(Mono.error(new CustomException("Transaction is already in a final state")))
                .flatMap(transaction -> {
                    // Generate new idempotency key
                    String newIdempotencyKey = UUID.randomUUID().toString();
                    transaction.setConfirmationCode(newIdempotencyKey);
                    transaction.setTransactionStatus(TransactionStatus.initiated.name());
                    transaction.setTransactionStatusDetails("Retrying STK Push...");

                    return transactionRepository.save(transaction)
                            .flatMap(saved -> pollPaymentStatus(saved));
                });
    }

    // ==================== PAYMENT CALLBACK HANDLER ====================

    public Mono<Transaction> handlePaymentCallback(String idempotencyKey, Map<String, Object> callbackData) {
        log.info("Handling payment callback for idempotency key: {}", idempotencyKey);

        return transactionRepository.findByConfirmationCode(idempotencyKey)
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found with idempotency key: " + idempotencyKey)))
                .flatMap(transaction -> {
                    // Parse callback data
                    String resultCode = (String) callbackData.get("resultCode");
                    String resultDescription = (String) callbackData.get("resultDescription");
                    String confirmationNumber = (String) callbackData.get("transactionConfirmationNumber");

                    if ("0".equals(resultCode)) {
                        transaction.setTransactionStatus(TransactionStatus.success.name());
                        transaction.setTransactionConfirmationNumber(confirmationNumber);
                        transaction.setTransactionStatusDetails("Payment confirmed via callback: " + resultDescription);
                    } else {
                        transaction.setTransactionStatus(TransactionStatus.failed.name());
                        transaction.setTransactionStatusDetails("Payment failed via callback: " + resultDescription);
                    }

                    transaction.setCallbackResp(callbackData);
                    return transactionRepository.save(transaction);
                });
    }

    // ==================== GET TRANSACTIONS ====================

    public Mono<Transaction> getTransactionById(UUID id, UUID userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")));
    }

    public Flux<Transaction> getRecentTransactions(UUID userId, int limit) {
        return transactionRepository.findRecentByUserId(userId, limit);
    }

    public Mono<Page<Transaction>> getTransactionsPage(UUID userId, Pageable pageable) {
        log.debug("Fetching transactions page for user: {}, page: {}, size: {}",
                userId, pageable.getPageNumber(), pageable.getPageSize());

        Flux<Transaction> transactionsFlux = transactionRepository.findByUserId(userId, pageable);
        Mono<Long> countMono = transactionRepository.countByUserId(userId);

        return transactionsFlux.collectList()
                .zipWith(countMono)
                .map(tuple -> {
                    java.util.List<Transaction> transactions = tuple.getT1();
                    Long total = tuple.getT2();
                    return new PageImpl<>(transactions, pageable, total);
                });
    }

    public Mono<Page<Transaction>> getTransactionsPageByBusiness(UUID businessId, Pageable pageable) {
        log.debug("Fetching transactions page for business: {}, page: {}, size: {}",
                businessId, pageable.getPageNumber(), pageable.getPageSize());

        Flux<Transaction> transactionsFlux = transactionRepository.findByBusinessId(businessId, pageable);
        Mono<Long> countMono = transactionRepository.countByBusinessId(businessId);

        return transactionsFlux.collectList()
                .zipWith(countMono)
                .map(tuple -> {
                    java.util.List<Transaction> transactions = tuple.getT1();
                    Long total = tuple.getT2();
                    return new PageImpl<>(transactions, pageable, total);
                });
    }

    public Mono<Page<Transaction>> getTransactionsPageWithBusiness(UUID userId, Pageable pageable) {
        return getCurrentBusinessId(userId)
                .flatMap(businessId -> {
                    log.debug("Fetching transactions for business: {}", businessId);
                    return getTransactionsPageByBusiness(businessId, pageable);
                })
                .switchIfEmpty(getTransactionsPage(userId, pageable));
    }

    public Flux<Transaction> getTransactionsByStatus(UUID userId, TransactionStatus status) {
        return transactionRepository.findByUserIdAndStatus(userId, status);
    }

    public Mono<Transaction> findByConfirmationCode(String confirmationCode) {
        return transactionRepository.findByConfirmationCode(confirmationCode);
    }

    public Mono<Transaction> findByReconciliationId(String reconciliationId) {
        return transactionRepository.findByReconciliationId(reconciliationId);
    }

    // ==================== UPDATE TRANSACTIONS ====================

    public Mono<Transaction> updateTransaction(UUID id, TransactionRequest request, UUID userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                .flatMap(existing -> {
                    // Only allow updates for non-successful transactions
                    if (existing.getTransactionStatus() == TransactionStatus.success.name()) {
                        return Mono.error(new CustomException("Cannot update a successful transaction"));
                    }

                    // Update fields
                    existing.setTransactionType(request.getTransactionType().name());
                    existing.setTransactionMethod(request.getTransactionMethod().name());
                    existing.setTransactionPurpose(request.getTransactionPurpose().name());
                    existing.setTransactionPurposeDetail(request.getTransactionPurposeDetail());
                    existing.setTransactionAmount(request.getTransactionAmount());
                    existing.setPaymentChannel(request.getPaymentChannel().name());
                    existing.setReceiverNumber(request.getReceiverNumber());
                    existing.setReceiverName(request.getReceiverName());
                    existing.setReceiverAccount(request.getReceiverAccount());
                    existing.setSenderNumber(request.getSenderNumber());
                    existing.setSenderName(request.getSenderName());
                    existing.setReconciliationId(request.getReconciliationId());
                    existing.setUpdatedAt(LocalDateTime.now());

                    // If changing to STK Push, initiate payment
                    if (request.getTransactionMethod() == TransactionMethod.stk_push &&
                            existing.getTransactionStatus() == TransactionStatus.initiated.name()) {
                        return processStkPushTransaction(existing, request);
                    }

                    return transactionRepository.save(existing);
                });
    }

    public Mono<Transaction> updateTransactionStatus(UUID id, TransactionStatus status, String details, UUID userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                .flatMap(transaction -> {
                    // Don't allow changing status of already successful transactions
                    if (transaction.getTransactionStatus() == TransactionStatus.success.name()) {
                        return Mono.error(new CustomException("Cannot change status of a successful transaction"));
                    }

                    transaction.setTransactionStatus(status.name());
                    transaction.setTransactionStatusDetails(details);
                    transaction.setUpdatedAt(LocalDateTime.now());
                    return transactionRepository.save(transaction);
                });
    }

    public Mono<Transaction> updateTransactionCallback(UUID id, String reconciliationId, Object callbackResp, UUID userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                .flatMap(transaction -> {
                    transaction.setReconciliationId(reconciliationId);
                    transaction.setCallbackResp((Map<String, Object>) callbackResp);
                    transaction.setUpdatedAt(LocalDateTime.now());
                    return transactionRepository.save(transaction);
                });
    }

    // ==================== DELETE TRANSACTION ====================

    public Mono<Void> deleteTransaction(UUID id, UUID userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                .flatMap(transactionRepository::delete);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private Mono<UUID> resolveBusinessId(TransactionRequest request, UUID userId) {
        if (request.getBusinessId() != null) {
            return Mono.just(request.getBusinessId());
        }
        return getCurrentBusinessId(userId)
                .switchIfEmpty(Mono.error(new CustomException("No business ID provided and user has no current business")));
    }

    private Mono<UUID> getCurrentBusinessId(UUID userId) {
        return userService.getCurrentBusinessId(userId);
    }

    private Transaction buildTransaction(TransactionRequest request, UUID businessId, UUID userId) {
        return Transaction.builder()
                .businessId(businessId)
                .userId(userId)
                .transactionType(request.getTransactionType().name())
                .transactionMethod(request.getTransactionMethod().name())
                .transactionPurpose(request.getTransactionPurpose().name())
                .transactionPurposeDetail(request.getTransactionPurposeDetail())
                .confirmationCode(request.getConfirmationCode())
                .transactionAmount(request.getTransactionAmount())
                .paymentChannel(request.getPaymentChannel().name())
                .receiverNumber(request.getReceiverNumber())
                .receiverName(request.getReceiverName())
                .receiverAccount(request.getReceiverAccount())
                .senderNumber(request.getSenderNumber())
                .senderName(request.getSenderName())
                .transactionStatus(TransactionStatus.initiated.name())
                .transactionStatusDetails("Transaction created")
                .reconciliationId(request.getReconciliationId())
                .callbackResp(request.getCallbackResp())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}