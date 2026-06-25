package com.mpesa.africa.biashara.book.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {
    private Integer salesVolume;           // Total number of sales transactions
    private BigDecimal moneyIn;            // Total amount paid (revenue)
    private BigDecimal moneyOut;           // Total cost of goods sold (COGS)
    private BigDecimal profit;             // MoneyIn - MoneyOut
    private BigDecimal profitMargin;       // (Profit / MoneyIn) * 100
    private String period;                 // "today", "week", "month", etc.
    private String startDate;
    private String endDate;
}