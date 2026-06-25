package com.mpesa.africa.biashara.book.model.dto.request;

import com.mpesa.africa.biashara.book.model.enums.ExpensePaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {
    @NotNull(message = "Expense type ID is required")
    private UUID expenseTypeId;

    private String otherName;

    @NotNull(message = "Expense amount is required")
    @Positive(message = "Expense amount must be positive")
    private BigDecimal expenseAmount;

    private UUID transactionId;

    private ExpensePaymentMethod paymentMethod;

    private Long sourceAccountId;

    private String destinationPaybill;

    private String accountReference;

    private String remarks;

    private String requester;
}
