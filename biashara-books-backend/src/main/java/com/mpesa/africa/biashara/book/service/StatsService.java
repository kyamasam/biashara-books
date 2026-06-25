package com.mpesa.africa.biashara.book.service;

import com.mpesa.africa.biashara.book.exception.CustomException;
import com.mpesa.africa.biashara.book.model.dto.response.StatsResponse;
import com.mpesa.africa.biashara.book.repository.ExpenseRepository;
import com.mpesa.africa.biashara.book.repository.InventoryRepository;
import com.mpesa.africa.biashara.book.repository.SalesRepository;
import com.mpesa.africa.biashara.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final SalesRepository salesRepository;
    private final ExpenseRepository expenseRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    public Mono<StatsResponse> getStats(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        return resolveBusinessId(userId)
                .flatMap(businessId -> Mono.zip(
                        getSales(userId, startDate, endDate),
                        getExpenses(businessId, startDate, endDate),
                        getStock(userId, startDate, endDate),
                        getStockValue(userId, startDate, endDate)
                ))
                .map(tuple -> {
                    BigDecimal sales = tuple.getT1();
                    BigDecimal expenses = tuple.getT2();

                    return StatsResponse.builder()
                            .sales(sales)
                            .expenses(expenses)
                            .profit(sales.subtract(expenses))
                            .stock(tuple.getT3())
                            .stockValue(tuple.getT4())
                            .startDate(startDate)
                            .endDate(endDate)
                            .build();
                });
    }

    private Mono<BigDecimal> getSales(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        if (hasDateRange(startDate, endDate)) {
            return salesRepository.sumCompletedTotalByUserIdAndDateRange(userId, startDate, endDate)
                    .defaultIfEmpty(BigDecimal.ZERO);
        }
        return salesRepository.sumCompletedTotalByUserId(userId)
                .defaultIfEmpty(BigDecimal.ZERO);
    }

    private Mono<BigDecimal> getExpenses(UUID businessId, LocalDateTime startDate, LocalDateTime endDate) {
        if (hasDateRange(startDate, endDate)) {
            return expenseRepository.sumCompletedExpenseAmountByBusinessIdAndDateRange(businessId, startDate, endDate)
                    .defaultIfEmpty(BigDecimal.ZERO);
        }
        return expenseRepository.sumCompletedExpenseAmountByBusinessId(businessId)
                .defaultIfEmpty(BigDecimal.ZERO);
    }

    private Mono<Double> getStock(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        if (hasDateRange(startDate, endDate)) {
            return inventoryRepository.sumQuantityByUserIdAndDateRange(userId, startDate, endDate)
                    .defaultIfEmpty(0.0);
        }
        return inventoryRepository.sumQuantityByUserId(userId)
                .defaultIfEmpty(0.0);
    }

    private Mono<BigDecimal> getStockValue(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        if (hasDateRange(startDate, endDate)) {
            return inventoryRepository.sumStockValueByUserIdAndDateRange(userId, startDate, endDate)
                    .map(BigDecimal::valueOf)
                    .defaultIfEmpty(BigDecimal.ZERO);
        }
        return inventoryRepository.sumStockValueByUserId(userId)
                .map(BigDecimal::valueOf)
                .defaultIfEmpty(BigDecimal.ZERO);
    }

    private Mono<UUID> resolveBusinessId(UUID userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new CustomException("User not found")))
                .flatMap(user -> Mono.justOrEmpty(user.getCurrentBusinessId())
                        .switchIfEmpty(Mono.error(new CustomException("No current business set"))));
    }

    private boolean hasDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return startDate != null && endDate != null;
    }
}
