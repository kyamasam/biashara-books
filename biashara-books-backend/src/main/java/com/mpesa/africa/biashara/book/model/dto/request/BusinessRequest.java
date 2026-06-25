package com.mpesa.africa.biashara.book.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessRequest {
    @NotBlank(message = "Business name is required")
    @Size(max = 100, message = "Business name must not exceed 100 characters")
    private String name;
    private String shortCode;
    @Builder.Default
    private String shortCodeType = "paybill";
    @Builder.Default
    @PositiveOrZero(message = "Shortcode balance must be zero or positive")
    private BigDecimal shortcodeBalance = BigDecimal.ZERO;
    @Builder.Default
    @PositiveOrZero(message = "Shortcode loan limit must be zero or positive")
    private BigDecimal shortcodeLoanLimit = BigDecimal.ZERO;
    private String fastdukaApiKey;
    private String fastdukaOrgId;
    private String fastdukaConfigId;
}
