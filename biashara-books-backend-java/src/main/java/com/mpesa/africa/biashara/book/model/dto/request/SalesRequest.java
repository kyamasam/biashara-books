package com.mpesa.africa.biashara.book.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesRequest {
    private List<SalesItemRequest> items;
    private BigDecimal amountPaid;
    private UUID transactionId;
}