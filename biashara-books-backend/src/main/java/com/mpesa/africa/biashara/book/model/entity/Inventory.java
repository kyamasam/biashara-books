package com.mpesa.africa.biashara.book.model.entity;

import com.mpesa.africa.biashara.book.model.enums.InventoryTypes;
import com.mpesa.africa.biashara.book.model.enums.UnitMetrics;
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
@Table("inventory")
public class Inventory {
    @Id
    private UUID id;
    private UUID productId;
    private Double quantity;
    private InventoryTypes inventoryType;
    private UnitMetrics unitMetric;
    private Double unitPurchasePrice;
    private BigDecimal unitSalePrice;
    private Boolean priceIncludesTax;
    private UUID userId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}