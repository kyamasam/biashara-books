package com.mpesa.africa.biashara.book.exception;

import lombok.Getter;

@Getter
public class PaymentException extends RuntimeException {
    private final String idempotencyKey;
    private final String errorCode;

    public PaymentException(String message, String idempotencyKey) {
        super(message);
        this.idempotencyKey = idempotencyKey;
        this.errorCode = null;
    }

    public PaymentException(String message, String idempotencyKey, String errorCode) {
        super(message);
        this.idempotencyKey = idempotencyKey;
        this.errorCode = errorCode;
    }
}