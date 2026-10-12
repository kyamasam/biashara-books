package com.mpesa.africa.biashara.book.model.dto.request;

import com.mpesa.africa.biashara.book.model.enums.InventoryCategory;
import com.mpesa.africa.biashara.book.model.enums.InventoryTypes;
import com.mpesa.africa.biashara.book.model.enums.UnitMetrics;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Photo URL must not exceed 500 characters")
    private String photoUrl;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private UUID productCategoryId;

    @NotNull(message = "Inventory category is required")
    @Schema(
        description = "Category of the product. Use 'physical' for tangible goods (e.g. maize, clothing, electronics) and 'service' for intangible offerings (e.g. haircut, delivery, repair).",
        allowableValues = {"physical", "service"},
        example = "physical"
    )
    private InventoryCategory inventoryCategory;

    @NotNull(message = "Inventory type is required")
    @Schema(
        description = "How the product quantity is measured. Use 'unit' when items are sold by a measurable metric (e.g. kg, litres) and 'count' when items are sold as discrete whole pieces (e.g. 1 shirt, 3 bags).",
        allowableValues = {"unit", "count"},
        example = "count"
    )
    private InventoryTypes inventoryType;

    @Schema(
        description = "The unit of measurement for this product. Required when inventoryType is 'unit'. Use 'kg' for weight-based items and 'l' for volume/liquid items.",
        allowableValues = {"kg", "l"},
        example = "kg"
    )
    private UnitMetrics unitMetric;
}