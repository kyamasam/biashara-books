package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.TransactionRequest;
import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public Mono<Transaction> createTransaction(TransactionRequest request, UUID userId) {
        log.info("Creating transaction for user: {}", userId);

        Transaction transaction = Transaction.builder()
                .transactionType(request.getTransactionType())
                .transactionMethod(request.getTransactionMethod())
                .transactionPurpose(request.getTransactionPurpose())
                .confirmationCode(request.getConfirmationCode())
                .transactionAmount(request.getTransactionAmount())
                .paymentChannel(request.getPaymentChannel())
                .receiverNumber(request.getReceiverNumber())
                .receiverAccount(request.getReceiverAccount())
                .transactionStatus(TransactionStatus.initiated)
                .transactionStatusDetails("Transaction initiated")
                .senderNumber(request.getSenderNumber())
                .reconciliationId(request.getReconciliationId())
                .callbackResp(request.getCallbackResp())
                .userId(userId)
                .build();

        return transactionRepository.save(transaction);
    }

    public Mono<Transaction> getTransactionById(UUID id, UUID userId) {
        return transactionRepository.findById(id)
                .filter(transaction -> transaction.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")));
    }

    public Flux<Transaction> getAllTransactions(UUID userId) {
        return transactionRepository.findByUserId(userId);
    }

    public Flux<Transaction> getRecentTransactions(UUID userId, int limit) {
        return transactionRepository.findRecentByUserId(userId, limit);
    }

    public Flux<Transaction> getTransactionsByStatus(TransactionStatus status) {
        return transactionRepository.findByStatus(status);
    }

    public Mono<Transaction> updateTransactionStatus(UUID id, TransactionStatus status, String details, UUID userId) {
        return transactionRepository.findById(id)
                .filter(transaction -> transaction.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                .flatMap(transaction -> {
                    transaction.setTransactionStatus(status);
                    transaction.setTransactionStatusDetails(details);
                    return transactionRepository.save(transaction);
                });
    }

    public Mono<Transaction> updateTransactionCallback(UUID id, String reconciliationId, Object callbackResp, UUID userId) {
        return transactionRepository.findById(id)
                .filter(transaction -> transaction.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                .flatMap(transaction -> {
                    transaction.setReconciliationId(reconciliationId);
                    transaction.setCallbackResp((java.util.Map<String, Object>) callbackResp);
                    return transactionRepository.save(transaction);
                });
    }
}