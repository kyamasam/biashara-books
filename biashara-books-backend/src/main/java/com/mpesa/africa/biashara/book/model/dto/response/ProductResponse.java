package com.mpesa.africa.biashara.book.model.dto.response;

import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.model.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String name;
    private String photoUrl;
    private String description;
    private UUID productCategoryId;
    private UUID businessId;
    private Double totalQuantity;
    private BigDecimal price;
    private List<Inventory> inventory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse from(Product product, Double totalQuantity, BigDecimal price, List<Inventory> inventory) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .photoUrl(product.getPhotoUrl())
                .description(product.getDescription())
                .productCategoryId(product.getProductCategoryId())
                .businessId(product.getBusinessId())
                .totalQuantity(totalQuantity)
                .price(price)
                .inventory(inventory)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
