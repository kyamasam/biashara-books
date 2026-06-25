package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentRetryScheduler {

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    @Scheduled(fixedDelay = 60000) // Run every minute
    public void retryPendingStkPushTransactions() {
        log.info("Checking for pending STK Push transactions to retry");

        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(5);

        transactionRepository.findPendingStkPushTransactions(null, cutoffTime)
                .flatMap(transaction -> {
                    log.info("Retrying transaction: {}", transaction.getId());
                    return transactionService.retryStkPush(transaction.getId(), transaction.getUserId())
                            .onErrorResume(error -> {
                                log.error("Failed to retry transaction {}: {}", transaction.getId(), error.getMessage());
                                return Mono.empty();
                            });
                })
                .subscribe();
    }
}