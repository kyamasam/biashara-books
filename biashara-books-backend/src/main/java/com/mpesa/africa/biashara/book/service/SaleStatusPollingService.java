package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.model.enums.SaleStatus;
import com.mpesa.africa.biashara.book.model.enums.TransactionStatus;
import com.mpesa.africa.biashara.book.repository.SalesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SaleStatusPollingService {

    private static final int MAX_POLLS = 10;
    private static final Duration POLL_INTERVAL = Duration.ofSeconds(8);

    private final StkPushService stkPushService;
    private final SalesRepository salesRepository;
    private final TransactionService transactionService;

    public Mono<Void> startPolling(UUID saleId, String idempotencyKey, UUID transactionId, UUID userId) {
        log.info("Starting background STK push polling for sale: {}, key: {}", saleId, idempotencyKey);

        return Flux.interval(POLL_INTERVAL)
                .take(MAX_POLLS)
                .flatMap(tick -> stkPushService.getStkPushStatus(idempotencyKey)
                        .doOnNext(s -> {
                            log.info("[STK-POLL] tick={} sale={} key='{}' rawStatus='{}' confirmationNumber='{}' responseCode='{}'",
                                    tick + 1, saleId, idempotencyKey,
                                    s.getTransactionStatus(),
                                    s.getTransactionConfirmationNumber(),
                                    s.getTransactionResponseCode());
                            log.info("[STK-POLL] isTerminal={} isSuccess={}",
                                    isTerminalStatus(s.getTransactionStatus()),
                                    isSuccessStatus(s.getTransactionStatus()));
                        })
                        .onErrorResume(e -> {
                            log.warn("[STK-POLL] tick={} sale={} key='{}' error: {}", tick + 1, saleId, idempotencyKey, e.getMessage());
                            return Mono.empty();
                        }))
                .filter(status -> isTerminalStatus(status.getTransactionStatus()))
                .next()
                .flatMap(status -> {
                    boolean success = isSuccessStatus(status.getTransactionStatus());
                    SaleStatus saleStatus = success ? SaleStatus.completed : SaleStatus.failed;
                    TransactionStatus txStatus = success ? TransactionStatus.success : TransactionStatus.failed;
                    String detail = success ? "STK push payment confirmed" : "STK push payment failed: " + status.getTransactionStatus();
                    String confirmationCode = status.getTransactionConfirmationNumber();

                    log.info("[STK-POLL] terminal for sale={} key='{}' rawStatus='{}' confirmationCode='{}' -> saleStatus={}", saleId, idempotencyKey, status.getTransactionStatus(), confirmationCode, saleStatus);
                    return updateSaleAndTransaction(saleId, transactionId, userId, saleStatus, txStatus, detail, confirmationCode)
                            .thenReturn(true);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("[STK-POLL] timed out after {} polls for sale={} key='{}', marking failed", MAX_POLLS, saleId, idempotencyKey);
                    return updateSaleAndTransaction(saleId, transactionId, userId,
                            SaleStatus.failed, TransactionStatus.failed, "STK push confirmation timed out", null)
                            .thenReturn(false);
                }))
                .then();
    }

    private Mono<Void> updateSaleAndTransaction(UUID saleId, UUID transactionId, UUID userId,
                                                SaleStatus saleStatus, TransactionStatus txStatus,
                                                String detail, String confirmationCode) {
        Mono<Void> updateSale = salesRepository.findById(saleId)
                .flatMap(sale -> {
                    sale.setSaleStatus(saleStatus);
                    return salesRepository.save(sale);
                })
                .doOnSuccess(s -> log.info("Sale {} updated to {}", saleId, saleStatus))
                .then();

        Mono<Void> updateTx = transactionService.updateTransactionStatus(transactionId, txStatus, detail, confirmationCode, userId)
                .doOnSuccess(t -> log.info("Transaction {} updated to {} confirmationCode={}", transactionId, txStatus, confirmationCode))
                .then();

        return Mono.when(updateSale, updateTx);
    }

    private boolean isTerminalStatus(String status) {
        if (status == null) return false;
        String lower = status.toLowerCase();
        return lower.contains("success") || lower.contains("completed") || lower.contains("processed")
                || lower.contains("failed") || lower.contains("cancelled");
    }

    private boolean isSuccessStatus(String status) {
        if (status == null) return false;
        String lower = status.toLowerCase();
        return lower.contains("success") || lower.contains("completed") || lower.contains("processed");
    }
}
