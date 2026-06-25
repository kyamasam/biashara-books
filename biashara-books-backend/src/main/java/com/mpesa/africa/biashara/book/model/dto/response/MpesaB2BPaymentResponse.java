package com.mpesa.africa.biashara.book.model.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MpesaB2BPaymentResponse {
    private Long id;
    private BigDecimal amount;

    @JsonProperty("destination_paybill")
    private String destinationPaybill;

    @JsonProperty("account_reference")
    private String accountReference;

    private String remarks;
    private String requester;

    @JsonProperty("conversation_id")
    private String conversationId;

    @JsonProperty("originator_conversation_id")
    private String originatorConversationId;

    @JsonProperty("mpesa_code")
    private String mpesaCode;

    private String status;
    private Map<String, Object> response;

    @JsonProperty("result_description")
    private String resultDescription;

    @JsonProperty("is_success")
    private Boolean success;
}
