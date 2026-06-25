package com.mpesa.africa.biashara.book.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessScoreResponse {

    private UUID businessId;

    /** Composite score from 0 to 100. */
    private BigDecimal score;

    /** Suggested maximum loan amount based on the score and revenue. */
    private BigDecimal loanLimit;

    private BigDecimal salesTotal;
    private BigDecimal transactionsSum;
    private BigDecimal expenses;
    private BigDecimal otherLoansTotal;

    /** Individual weighted contribution of each component (0–100 each). */
    private Map<String, BigDecimal> breakdown;

    private int periodMonths;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
}
