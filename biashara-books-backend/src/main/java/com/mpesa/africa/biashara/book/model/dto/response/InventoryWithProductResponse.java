package com.mpesa.africa.biashara.book.model.dto.response;

import com.mpesa.africa.biashara.book.model.entity.Inventory;
import com.mpesa.africa.biashara.book.model.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryWithProductResponse {
    private Inventory inventory;
    private Product product;
}
