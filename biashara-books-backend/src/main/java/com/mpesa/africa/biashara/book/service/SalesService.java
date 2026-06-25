package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.*;
import com.mpesa.africa.biashara.book.model.entity.Sales;
import com.mpesa.africa.biashara.book.model.entity.SalesDetail;
import com.mpesa.africa.biashara.book.model.enums.*;
import com.mpesa.africa.biashara.book.repository.SalesDetailRepository;
import com.mpesa.africa.biashara.book.repository.SalesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesService {

    private final SalesRepository salesRepository;
    private final SalesDetailRepository salesDetailRepository;
    private final TransactionService transactionService;
    private final StkPushService stkPushService;
    private final SaleStatusPollingService saleStatusPollingService;

    public Mono<Sales> createSales(SalesRequest request, UUID userId) {
        log.info("Creating sale for user: {}, paymentMethod: {}", userId, request.getPaymentMethod());

        BigDecimal subTotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        List<SalesDetail> details = new ArrayList<>();

        for (var item : request.getItems()) {
            BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subTotal = subTotal.add(itemTotal);
            BigDecimal tax = itemTotal.multiply(BigDecimal.valueOf(0.16));
            taxTotal = taxTotal.add(tax);

            details.add(SalesDetail.builder()
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .totalTax(tax)
                    .totalPrice(itemTotal)
                    .inventoryId(item.getInventoryId())
                    .build());
        }

        BigDecimal total = subTotal.add(taxTotal);

        if (request.getPaymentMethod() == SalePaymentMethod.cash) {
            return createCashSale(request, userId, subTotal, taxTotal, total, details);
        } else {
            return createMpesaSale(request, userId, subTotal, taxTotal, total, details);
        }
    }

    private Mono<Sales> createCashSale(SalesRequest request, UUID userId,
                                        BigDecimal subTotal, BigDecimal taxTotal,
                                        BigDecimal total, List<SalesDetail> details) {
        TransactionRequest txReq = TransactionRequest.builder()
                .transactionType(TransactionType.credit)
                .transactionMethod(TransactionMethod.cash)
                .transactionPurpose(TransactionPurpose.sale_payment)
                .transactionPurposeDetail("Cash sale payment")
                .transactionAmount(request.getAmountPaid())
                .paymentChannel(PaymentChannel.cash)
                .build();

        return transactionService.createTransaction(txReq, userId)
                .flatMap(tx -> transactionService.updateTransactionStatus(
                        tx.getId(), TransactionStatus.success, "Cash payment received", userId))
                .flatMap(tx -> {
                    Sales sale = Sales.builder()
                            .subTotal(subTotal)
                            .taxTotal(taxTotal)
                            .total(total)
                            .amountPaid(request.getAmountPaid())
                            .transactionId(tx.getId())
                            .paymentMethod(SalePaymentMethod.cash)
                            .saleStatus(SaleStatus.completed)
                            .userId(userId)
                            .build();
                    return salesRepository.save(sale);
                })
                .flatMap(savedSale -> saveDetails(savedSale, details));
    }

    private Mono<Sales> createMpesaSale(SalesRequest request, UUID userId,
                                         BigDecimal subTotal, BigDecimal taxTotal,
                                         BigDecimal total, List<SalesDetail> details) {
        if (request.getCustomerPhone() == null || request.getCustomerPhone().isBlank()) {
            return Mono.error(new CustomException("Customer phone is required for MPESA payment"));
        }

        StkPushInitiateRequest stkReq = new StkPushInitiateRequest();
        stkReq.setPhoneNumber(request.getCustomerPhone());
        stkReq.setAmount(request.getAmountPaid());
        stkReq.setTransactionNote("Sale payment");

        return stkPushService.initiateStkPush(stkReq, userId)
                .flatMap(stkResp -> {
                    TransactionRequest txReq = TransactionRequest.builder()
                            .transactionType(TransactionType.credit)
                            .transactionMethod(TransactionMethod.stk_push)
                            .transactionPurpose(TransactionPurpose.sale_payment)
                            .transactionPurposeDetail("MPESA sale payment")
                            .transactionAmount(request.getAmountPaid())
                            .paymentChannel(PaymentChannel.paybill)
                            .reconciliationId(stkResp.getIdempotencyKey())
                            .build();

                    return Mono.zip(
                            transactionService.createTransaction(txReq, userId),
                            Mono.just(stkResp.getIdempotencyKey())
                    );
                })
                .flatMap(tuple -> {
                    var tx = tuple.getT1();
                    String idempotencyKey = tuple.getT2();

                    Sales sale = Sales.builder()
                            .subTotal(subTotal)
                            .taxTotal(taxTotal)
                            .total(total)
                            .amountPaid(request.getAmountPaid())
                            .transactionId(tx.getId())
                            .paymentMethod(SalePaymentMethod.mpesa)
                            .saleStatus(SaleStatus.pending)
                            .stkIdempotencyKey(idempotencyKey)
                            .userId(userId)
                            .build();

                    return salesRepository.save(sale);
                })
                .flatMap(savedSale -> saveDetails(savedSale, details))
                .doOnSuccess(sale -> saleStatusPollingService
                        .startPolling(sale.getId(), sale.getStkIdempotencyKey(), sale.getTransactionId(), userId)
                        .subscribeOn(Schedulers.boundedElastic())
                        .subscribe(null, e -> log.error("Background STK polling failed for sale: {}", sale.getId(), e)));
    }

    private Mono<Sales> saveDetails(Sales savedSale, List<SalesDetail> details) {
        details.forEach(d -> d.setSaleId(savedSale.getId()));
        return Flux.fromIterable(details)
                .flatMap(salesDetailRepository::save)
                .collectList()
                .thenReturn(savedSale);
    }

    public Mono<Sales> getSalesById(UUID id, UUID userId) {
        return salesRepository.findById(id)
                .filter(sales -> sales.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Sales not found or access denied")));
    }

    public Flux<Sales> getAllSales(UUID userId) {
        return salesRepository.findByUserId(userId);
    }

    public Flux<Sales> getSalesByDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        return salesRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    public Flux<SalesDetail> getSalesDetails(UUID saleId, UUID userId) {
        return salesRepository.findById(saleId)
                .filter(sales -> sales.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new CustomException("Sales not found or access denied")))
                .flatMapMany(sales -> salesDetailRepository.findBySaleId(saleId));
    }

    public Mono<BigDecimal> getTotalSalesAmount(UUID userId) {
        return salesRepository.sumTotalByUserId(userId)
                .map(BigDecimal::valueOf)
                .defaultIfEmpty(BigDecimal.ZERO);
    }
}
