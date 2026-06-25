// model/dto/payment/InitiatePaymentRequest.java
package com.mpesa.africa.biashara.book.model.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitiatePaymentRequest {
    @JsonProperty("customer_account_number")
    private String customerAccountNumber;

    private Double amount;

    @JsonProperty("receiving_account_number")
    private String receivingAccountNumber;

    @JsonProperty("receiving_organization_id")
    private String receivingOrganizationId;

    @JsonProperty("payment_method_name")
    @Builder.Default
    private String paymentMethodName = "mpesa";

    @JsonProperty("payment_method_subtype")
    @Builder.Default
    private String paymentMethodSubtype = "stk_push";

    @JsonProperty("config_id")
    private String configId;

    @JsonProperty("transaction_note")
    private String transactionNote;
}