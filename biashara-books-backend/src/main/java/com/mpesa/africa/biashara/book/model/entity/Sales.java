package com.mpesa.africa.biashara.book.model.entity;

import com.mpesa.africa.biashara.book.model.enums.SalePaymentMethod;
import com.mpesa.africa.biashara.book.model.enums.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("sales")
public class Sales {
    @Id
    private UUID id;
    private BigDecimal subTotal;
    private BigDecimal taxTotal;
    private BigDecimal total;
    private BigDecimal amountPaid;
    private UUID transactionId;
    private UUID userId;
    private SalePaymentMethod paymentMethod;
    private SaleStatus saleStatus;
    private String stkIdempotencyKey;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
