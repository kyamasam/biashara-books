package com.mpesa.africa.biashara.book.model.entity;

import com.mpesa.africa.biashara.book.model.enums.BusinessUserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("business_user")
public class BusinessUser {
    @Id
    private UUID id;
    private UUID businessId;
    private UUID userId;
    private BusinessUserRole role;
    private UUID currentLocationId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
