package com.mpesa.africa.biashara.book.model.entity;

import com.mpesa.africa.biashara.book.model.enums.ExpensePaymentMethod;
import com.mpesa.africa.biashara.book.model.enums.ExpenseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("expenses")
public class Expense {
    @Id
    private UUID id;
    private UUID expenseTypeId;
    private String otherName;
    private BigDecimal expenseAmount;
    private UUID transactionId;
    private ExpensePaymentMethod paymentMethod;
    private ExpenseStatus expenseStatus;
    private String b2bConversationId;
    private UUID userId;
    private UUID businessId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
