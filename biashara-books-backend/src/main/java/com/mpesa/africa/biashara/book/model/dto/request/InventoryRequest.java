package com.mpesa.africa.biashara.book.model.dto.request;

import com.mpesa.africa.biashara.book.model.enums.InventoryTypes;
import com.mpesa.africa.biashara.book.model.enums.UnitMetrics;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequest {
    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Inventory type is required")
    private InventoryTypes inventoryType;

    private UnitMetrics unitMetric;

    @NotNull(message = "Unit purchase price is required")
    @Positive(message = "Unit purchase price must be positive")
    private Double unitPurchasePrice;

    @NotNull(message = "Unit sale price is required")
    @Positive(message = "Unit sale price must be positive")
    private BigDecimal unitSalePrice;

    private Boolean priceIncludesTax;
}