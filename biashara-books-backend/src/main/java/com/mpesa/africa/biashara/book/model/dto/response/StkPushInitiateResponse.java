package com.mpesa.africa.biashara.book.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StkPushInitiateResponse {
    private String idempotencyKey;
    private String transactionStatus;
}
