package com.mpesa.africa.biashara.book.model.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FastDukaTransactionResponse {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("idempotency_key")
    private String idempotencyKey;

    @JsonProperty("customer_account_number")
    private String customerAccountNumber;

    @JsonProperty("amount")
    private BigDecimal amount;

    @JsonProperty("transaction_status")
    private String transactionStatus;

    @JsonProperty("transaction_confirmation_number")
    private String transactionConfirmationNumber;

    @JsonProperty("transaction_response_code")
    private String transactionResponseCode;

    @JsonProperty("transaction_note")
    private String transactionNote;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;
}
