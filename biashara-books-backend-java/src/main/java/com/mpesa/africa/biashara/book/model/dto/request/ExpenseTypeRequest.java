package com.mpesa.africa.biashara.book.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseTypeRequest {
    @NotBlank(message = "Expense type name is required")
    @Size(max = 50, message = "Expense type name must not exceed 50 characters")
    private String name;
}