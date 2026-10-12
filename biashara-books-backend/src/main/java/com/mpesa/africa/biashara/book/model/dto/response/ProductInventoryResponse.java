package com.mpesa.africa.biashara.book.model.dto.response;

import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.model.enums.InventoryCategory;
import com.mpesa.africa.biashara.book.model.enums.InventoryTypes;
import com.mpesa.africa.biashara.book.model.enums.UnitMetrics;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInventoryResponse {
    private UUID id;
    private String name;
    private String photoUrl;
    private String description;
    private UUID productCategoryId;
    private UUID businessId;
    private UUID userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private InventoryTypes inventoryType;
    private InventoryCategory inventoryCategory;
    private UnitMetrics unitMetric;
    private List<Inventory> inventories;
    private Double totalQuantity;
    private Boolean inStock;
}
