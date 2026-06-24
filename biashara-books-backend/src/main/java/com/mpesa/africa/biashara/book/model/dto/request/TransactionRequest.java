package com.mpesa.africa.biashara.book.model.dto.request;

import com.mpesa.africa.biashara.book.model.enums.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {
    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    @NotNull(message = "Transaction method is required")
    private TransactionMethod transactionMethod;

    @NotNull(message = "Transaction purpose is required")
    private TransactionPurpose transactionPurpose;

    private String confirmationCode;

    @NotNull(message = "Transaction amount is required")
    @Positive(message = "Transaction amount must be positive")
    private BigDecimal transactionAmount;

    @NotNull(message = "Payment channel is required")
    private PaymentChannel paymentChannel;

    private String receiverNumber;
    private String receiverAccount;
    private String senderNumber;
    private String reconciliationId;
    private Map<String, Object> callbackResp;
}