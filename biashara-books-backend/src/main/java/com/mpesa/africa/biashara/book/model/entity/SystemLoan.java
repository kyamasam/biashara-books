package com.mpesa.africa.biashara.book.model.entity;

import com.mpesa.africa.biashara.book.model.enums.InstitutionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("system_loan")
public class SystemLoan {
    @Id
    private UUID id;
    private String institutionName;
    private InstitutionType institutionType;
    private BigDecimal loanBalance;
    private BigDecimal monthlyRepaymentAmount;
    private LocalDate endDate;
    private UUID userId;
    private UUID businessId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
