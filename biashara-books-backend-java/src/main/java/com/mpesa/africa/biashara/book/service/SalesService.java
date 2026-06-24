package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.request.*;
import com.mpesa.africa.biashara.book.model.entity.Sales;
import com.mpesa.africa.biashara.book.model.entity.SalesDetail;
import com.mpesa.africa.biashara.book.repository.SalesDetailRepository;
import com.mpesa.africa.biashara.book.repository.SalesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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

    @Transactional
    public Mono<Sales> createSales(SalesRequest request, UUID userId) {
        log.info("Creating sales for user: {}", userId);

        // Calculate totals
        BigDecimal subTotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        List<SalesDetail> details = new ArrayList<>();

        for (var item : request.getItems()) {
            BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subTotal = subTotal.add(itemTotal);

            // Assuming 16% VAT for demonstration
            BigDecimal tax = itemTotal.multiply(BigDecimal.valueOf(0.16));
            taxTotal = taxTotal.add(tax);

            SalesDetail detail = SalesDetail.builder()
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .totalTax(tax)
                    .totalPrice(itemTotal)
                    .inventoryId(item.getInventoryId())
                    .build();
            details.add(detail);
        }

        BigDecimal total = subTotal.add(taxTotal);

        Sales sales = Sales.builder()
                .subTotal(subTotal)
                .taxTotal(taxTotal)
                .total(total)
                .amountPaid(request.getAmountPaid())
                .transactionId(request.getTransactionId())
                .userId(userId)
                .build();

        return salesRepository.save(sales)
                .flatMap(savedSales -> {
                    // Save sales details
                    details.forEach(detail -> detail.setSaleId(savedSales.getId()));
                    return Flux.fromIterable(details)
                            .flatMap(salesDetailRepository::save)
                            .collectList()
                            .thenReturn(savedSales);
                });
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