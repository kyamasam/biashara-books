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
    private TransactionType transactionType;
    private TransactionMethod transactionMethod;
    private TransactionPurpose transactionPurpose;
    private String transactionPurposeDetail;
    private String confirmationCode;
    private BigDecimal transactionAmount;
    private PaymentChannel paymentChannel;
    private String receiverNumber;
    private String receiverName;
    private String receiverAccount;
    private TransactionStatus transactionStatus;
    private String transactionStatusDetails;
    private String senderNumber;
    private String senderName;
    private String reconciliationId;
    private Map<String, Object> callbackResp;
    private UUID userId;
    private UUID businessId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
