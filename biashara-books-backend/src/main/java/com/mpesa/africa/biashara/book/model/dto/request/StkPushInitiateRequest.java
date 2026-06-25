package com.mpesa.africa.biashara.book.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StkPushInitiateRequest {

    @NotBlank(message = "Phone number is required (format: 2547XXXXXXXX)")
    private String phoneNumber;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1", message = "Amount must be at least 1")
    private BigDecimal amount;

    @NotBlank(message = "Transaction note is required")
    private String transactionNote;
}
