package com.mpesa.africa.biashara.book.model.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MpesaB2BPaymentRequest {
    @JsonProperty("source_account_id")
    private Long sourceAccountId;

    private BigDecimal amount;

    @JsonProperty("destination_paybill")
    private String destinationPaybill;

    @JsonProperty("account_reference")
    private String accountReference;

    private String remarks;

    private String requester;
}
