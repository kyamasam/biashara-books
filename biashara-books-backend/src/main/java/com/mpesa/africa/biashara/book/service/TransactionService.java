package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.TransactionRequest;
import com.mpesa.africa.biashara.book.model.entity.Transaction;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.repository.BusinessRepository;
import com.mpesa.africa.biashara.book.repository.TransactionRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;

    public Mono<Transaction> createTransaction(TransactionRequest request, UUID userId) {
        log.info("Creating transaction for user: {}", userId);

        return resolveBusinessId(request.getBusinessId(), userId)
                .flatMap(businessId -> {
                    Transaction transaction = Transaction.builder()
                            .transactionType(request.getTransactionType())
                            .transactionMethod(request.getTransactionMethod())
                            .transactionPurpose(request.getTransactionPurpose())
                            .transactionPurposeDetail(request.getTransactionPurposeDetail())
                            .confirmationCode(request.getConfirmationCode())
                            .transactionAmount(request.getTransactionAmount())
                            .paymentChannel(request.getPaymentChannel())
                            .receiverNumber(request.getReceiverNumber())
                            .receiverName(request.getReceiverName())
                            .receiverAccount(request.getReceiverAccount())
                            .transactionStatus(TransactionStatus.initiated)
                            .transactionStatusDetails("Transaction initiated")
                            .senderNumber(request.getSenderNumber())
                            .senderName(request.getSenderName())
                            .reconciliationId(request.getReconciliationId())
                            .callbackResp(request.getCallbackResp())
                            .userId(userId)
                            .businessId(businessId)
                            .build();

                    return transactionRepository.save(transaction);
                });
    }

    public Mono<Transaction> getTransactionById(UUID id, UUID userId) {
        return resolveCurrentBusinessId(userId)
                .flatMap(businessId -> transactionRepository.findById(id)
                        .filter(transaction -> businessId.equals(transaction.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied"))));
    }

    public Flux<Transaction> getAllTransactions(UUID userId) {
        return resolveCurrentBusinessId(userId)
                .flatMapMany(transactionRepository::findByBusinessId);
    }

    public Mono<Page<Transaction>> getTransactionsPage(UUID userId, Pageable pageable) {
        return resolveCurrentBusinessId(userId)
                .flatMap(businessId -> Mono.zip(
                        transactionRepository.findByBusinessId(
                                businessId,
                                pageable.getPageSize(),
                                pageable.getOffset()
                        ).collectList(),
                        transactionRepository.countByBusinessId(businessId)
                ).map(tuple -> {
                    List<Transaction> transactions = tuple.getT1();
                    long total = tuple.getT2();
                    return new PageImpl<>(transactions, pageable, total);
                }));
    }

    public Flux<Transaction> getRecentTransactions(UUID userId, int limit) {
        return resolveCurrentBusinessId(userId)
                .flatMapMany(businessId -> transactionRepository.findRecentByBusinessId(businessId, limit));
    }

    public Flux<Transaction> getTransactionsByStatus(TransactionStatus status, UUID userId) {
        return resolveCurrentBusinessId(userId)
                .flatMapMany(businessId -> transactionRepository.findByBusinessIdAndStatus(businessId, status));
    }

    public Mono<Transaction> updateTransaction(UUID id, TransactionRequest request, UUID userId) {
        return resolveCurrentBusinessId(userId)
                .flatMap(currentBusinessId -> transactionRepository.findById(id)
                        .filter(transaction -> currentBusinessId.equals(transaction.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                        .flatMap(transaction -> resolveBusinessId(request.getBusinessId(), userId)
                                .flatMap(businessId -> {
                                    transaction.setTransactionType(request.getTransactionType());
                                    transaction.setTransactionMethod(request.getTransactionMethod());
                                    transaction.setTransactionPurpose(request.getTransactionPurpose());
                                    transaction.setTransactionPurposeDetail(request.getTransactionPurposeDetail());
                                    transaction.setConfirmationCode(request.getConfirmationCode());
                                    transaction.setTransactionAmount(request.getTransactionAmount());
                                    transaction.setPaymentChannel(request.getPaymentChannel());
                                    transaction.setReceiverNumber(request.getReceiverNumber());
                                    transaction.setReceiverName(request.getReceiverName());
                                    transaction.setReceiverAccount(request.getReceiverAccount());
                                    transaction.setSenderNumber(request.getSenderNumber());
                                    transaction.setSenderName(request.getSenderName());
                                    transaction.setReconciliationId(request.getReconciliationId());
                                    transaction.setCallbackResp(request.getCallbackResp());
                                    transaction.setBusinessId(businessId);
                                    return transactionRepository.save(transaction);
                                })));
    }

    public Mono<Transaction> updateTransactionStatus(UUID id, TransactionStatus status, String details, UUID userId) {
        return resolveCurrentBusinessId(userId)
                .flatMap(businessId -> transactionRepository.findById(id)
                        .filter(transaction -> businessId.equals(transaction.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                        .flatMap(transaction -> {
                            transaction.setTransactionStatus(status);
                            transaction.setTransactionStatusDetails(details);
                            return transactionRepository.save(transaction);
                        }));
    }

    public Mono<Transaction> updateTransactionCallback(UUID id, String reconciliationId, Object callbackResp, UUID userId) {
        return resolveCurrentBusinessId(userId)
                .flatMap(businessId -> transactionRepository.findById(id)
                        .filter(transaction -> businessId.equals(transaction.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                        .flatMap(transaction -> {
                            transaction.setReconciliationId(reconciliationId);
                            transaction.setCallbackResp((java.util.Map<String, Object>) callbackResp);
                            return transactionRepository.save(transaction);
                        }));
    }

    public Mono<Void> deleteTransaction(UUID id, UUID userId) {
        return resolveCurrentBusinessId(userId)
                .flatMap(businessId -> transactionRepository.findById(id)
                        .filter(transaction -> businessId.equals(transaction.getBusinessId()))
                        .switchIfEmpty(Mono.error(new CustomException("Transaction not found or access denied")))
                        .flatMap(transactionRepository::delete));
    }

    private Mono<UUID> resolveBusinessId(UUID requestedBusinessId, UUID userId) {
        return Mono.justOrEmpty(requestedBusinessId)
                .flatMap(businessId -> businessRepository.findById(businessId)
                        .filter(business -> userId.equals(business.getUserId()))
                        .map(business -> businessId)
                        .switchIfEmpty(Mono.error(new CustomException("Business not found or access denied"))))
                .switchIfEmpty(resolveCurrentBusinessId(userId));
    }

    private Mono<UUID> resolveCurrentBusinessId(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> Mono.justOrEmpty(user.getCurrentBusinessId())
                        .switchIfEmpty(Mono.error(new CustomException("No current business set"))))
                .flatMap(businessId -> businessRepository.findById(businessId)
                        .filter(business -> userId.equals(business.getUserId()))
                        .map(business -> businessId)
                        .switchIfEmpty(Mono.error(new CustomException("Business not found or access denied"))));
    }
}
