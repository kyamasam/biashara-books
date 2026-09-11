package com.mpesa.africa.biashara.book.model.dto.response;

import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.model.entity.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessRegistrationResponse {
    private String token;
    private UUID userId;
    private String username;
    private String email;
    private String phoneCode;
    private String phoneNumber;
    private Business business;
    private List<Location> locations;
}
