package com.mpesa.africa.biashara.book.repository;

import com.mpesa.africa.biashara.book.model.entity.Sales;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface StatisticsRepository extends ReactiveCrudRepository<Sales, UUID> {

    // Get sales count for a user in a date range
    @Query("SELECT COUNT(*) FROM sales WHERE user_id = $1 AND created_at BETWEEN $2 AND $3")
    Mono<Long> countSalesByUserIdAndDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    // Get total money in (total amount paid) for a user in a date range
    @Query("SELECT COALESCE(SUM(amount_paid), 0) FROM sales WHERE user_id = $1 AND created_at BETWEEN $2 AND $3")
    Mono<BigDecimal> sumAmountPaidByUserIdAndDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    // Get total money out (cost of goods sold) for a user in a date range
    // This joins sales_details with inventory to get the purchase price
    @Query("SELECT COALESCE(SUM(sd.quantity * i.unit_purchase_price), 0) " +
            "FROM sales s " +
            "JOIN sales_details sd ON s.id = sd.sale_id " +
            "JOIN inventory i ON sd.inventory_id = i.id " +
            "WHERE s.user_id = $1 AND s.created_at BETWEEN $2 AND $3")
    Mono<BigDecimal> sumCostOfGoodsSoldByUserIdAndDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    // Get total money out (alternative - using total_price from sales_details if it represents cost)
    @Query("SELECT COALESCE(SUM(sd.total_price), 0) " +
            "FROM sales s " +
            "JOIN sales_details sd ON s.id = sd.sale_id " +
            "WHERE s.user_id = $1 AND s.created_at BETWEEN $2 AND $3")
    Mono<BigDecimal> sumTotalPriceByUserIdAndDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    // Get all sales with details for a user in a date range
    @Query("SELECT s.* FROM sales s WHERE s.user_id = $1 AND s.created_at BETWEEN $2 AND $3")
    Flux<Sales> findSalesByUserIdAndDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate);
}