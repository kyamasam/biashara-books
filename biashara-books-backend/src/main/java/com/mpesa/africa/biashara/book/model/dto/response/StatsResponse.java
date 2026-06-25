package com.mpesa.africa.biashara.book.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private BigDecimal profit;
    private BigDecimal sales;
    private BigDecimal expenses;
    private Double stock;
    private BigDecimal stockValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
