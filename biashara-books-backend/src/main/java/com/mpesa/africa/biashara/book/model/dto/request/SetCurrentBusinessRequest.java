package com.mpesa.africa.biashara.book.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetCurrentBusinessRequest {
    @NotNull(message = "Business ID is required")
    private UUID businessId;
}
