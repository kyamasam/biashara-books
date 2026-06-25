package com.mpesa.africa.biashara.book.model.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FastDukaAccountBalanceResponse {
    private Long id;

    @JsonProperty("account_identifier")
    private String accountIdentifier;

    @JsonProperty("account_balance")
    private BigDecimal accountBalance;

    @JsonProperty("balance_last_update")
    private String balanceLastUpdate;
}
