package com.mpesa.africa.biashara.book.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("sales_details")
public class SalesDetail {
    @Id
    private UUID id;
    private UUID saleId;
    private Double quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalTax;
    private BigDecimal totalPrice;
    private UUID inventoryId;

    @CreatedDate
    private LocalDateTime createdAt;
}
