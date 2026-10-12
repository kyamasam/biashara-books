package com.mpesa.africa.biashara.book.model.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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

    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Unit purchase price is required")
    @Positive(message = "Unit purchase price must be positive")
    private Double unitPurchasePrice;

    @NotNull(message = "Unit sale price is required")
    @Positive(message = "Unit sale price must be positive")
    private BigDecimal unitSalePrice;

    @Schema(
        description = "Indicates whether the sale price already includes tax (e.g. VAT). Set to true if the unitSalePrice is the final tax-inclusive price shown to customers. Set to false if tax is calculated and added on top at checkout.",
        example = "false"
    )
    private Boolean priceIncludesTax;

    private UUID locationId;
}