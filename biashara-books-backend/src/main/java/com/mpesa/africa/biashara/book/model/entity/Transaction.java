package com.mpesa.africa.biashara.book.model.entity;

import com.mpesa.africa.biashara.book.model.enums.*;
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
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("transaction")
public class Transaction {
    @Id
    private UUID id;
    private UUID businessId;
    private UUID userId;
    private String transactionType;
    private String transactionMethod;
    private String transactionPurpose;
    private String transactionPurposeDetail;
    private String confirmationCode;
    private String transactionConfirmationNumber;
    private BigDecimal transactionAmount;
    private String paymentChannel;
    private String receiverNumber;
    private String receiverName;
    private String receiverAccount;
    private String senderNumber;
    private String senderName;
    private String transactionStatus;
    private String transactionStatusDetails;
    private String reconciliationId;
    private Map<String, Object> callbackResp;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}