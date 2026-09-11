package com.mpesa.africa.biashara.book.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationRegistrationRequest {
    @NotBlank(message = "Location name is required")
    private String name;

    @Builder.Default
    private Boolean isDefault = Boolean.FALSE;
}
