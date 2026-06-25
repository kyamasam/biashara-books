package com.mpesa.africa.biashara.book.model.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;

    @JsonProperty("customer_account_number")
    private String customerAccountNumber;

    private Double amount;

    @JsonProperty("idempotency_key")
    private String idempotencyKey;

    @JsonProperty("transaction_status")
    private String transactionStatus;

    @JsonProperty("transaction_confirmation_number")
    private String transactionConfirmationNumber;

    @JsonProperty("transaction_response_code")
    private String transactionResponseCode;

    @JsonProperty("transaction_response")
    private Map<String, Object> transactionResponse;

    @JsonProperty("transaction_note")
    private String transactionNote;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    // Success check
    public boolean isSuccess() {
        return "processed".equalsIgnoreCase(transactionStatus) &&
                "0".equals(transactionResponseCode);
    }

    public boolean isInitiated() {
        return "initiated".equalsIgnoreCase(transactionStatus);
    }

    public boolean isFailed() {
        return "failed".equalsIgnoreCase(transactionStatus);
    }
}