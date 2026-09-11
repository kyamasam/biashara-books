package com.mpesa.africa.biashara.book.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessRegistrationRequest {
    @Valid
    @NotNull(message = "User details are required")
    private UserRegistrationRequest user;

    @Valid
    @NotNull(message = "Business details are required")
    private BusinessRequest business;

    @Valid
    private List<LocationRegistrationRequest> locations;
}
