package com.mpesa.africa.biashara.book.model.dto.request;

import com.mpesa.africa.biashara.book.model.enums.SalePaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesRequest {
    private List<SalesItemRequest> items;

    @NotNull(message = "Amount paid is required")
    @Positive(message = "Amount paid must be positive")
    private BigDecimal amountPaid;

    @NotNull(message = "Payment method is required")
    private SalePaymentMethod paymentMethod;

    private String customerPhone;
}
