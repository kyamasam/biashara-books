package com.mpesa.africa.biashara.book.model.dto.request;

import com.mpesa.africa.biashara.book.model.enums.InstitutionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanRequest {
    @NotNull(message = "Institution name is required")
    @Size(max = 100, message = "Institution name must not exceed 100 characters")
    private String institutionName;

    @NotNull(message = "Institution type is required")
    private InstitutionType institutionType;

    @Size(max = 500, message = "Institution logo URL must not exceed 500 characters")
    private String institutionLogoUrl;

    @NotNull(message = "Loan balance is required")
    @Positive(message = "Loan balance must be positive")
    private BigDecimal loanBalance;

    @NotNull(message = "Monthly repayment amount is required")
    @Positive(message = "Monthly repayment amount must be positive")
    private BigDecimal monthlyRepaymentAmount;

    @NotNull(message = "End date is required")
    private LocalDate endDate;
}
