package com.mpesa.africa.biashara.book.model.dto.response;

import com.mpesa.africa.biashara.book.model.entity.Business;
import com.mpesa.africa.biashara.book.model.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String passwordHash;
    private String phoneCode;
    private String phoneNumber;
    private String pinHash;
    private UUID currentBusinessId;
    private Business currentBusiness;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserResponse from(User user, Business currentBusiness) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .passwordHash(user.getPasswordHash())
                .phoneCode(user.getPhoneCode())
                .phoneNumber(user.getPhoneNumber())
                .pinHash(user.getPinHash())
                .currentBusinessId(user.getCurrentBusinessId())
                .currentBusiness(currentBusiness)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
