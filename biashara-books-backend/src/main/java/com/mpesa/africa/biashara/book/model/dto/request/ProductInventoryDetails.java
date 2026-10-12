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
public class ProductInventoryDetails {

    @Positive(message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Unit purchase price is required")
    @Positive(message = "Unit purchase price must be positive")
    private Double unitPurchasePrice;

    @NotNull(message = "Unit sale price is required")
    @Positive(message = "Unit sale price must be positive")
    private BigDecimal unitSalePrice;

    @Schema(
        description = "Indicates whether the sale price already includes tax (e.g. VAT). Defaults to false.",
        example = "false"
    )
    private Boolean priceIncludesTax;

    private UUID locationId;
}
