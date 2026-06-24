package com.mpesa.africa.biashara.book.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        description = """
                Payment flow or settlement method used for a transaction.
                - stk_push: Customer authorizes an M-PESA STK push prompt.
                - b2c: Business-to-customer M-PESA payment.
                - c2b: Customer-to-business M-PESA payment.
                - b2b: Business-to-business M-PESA payment.
                - cash: Cash payment handled outside M-PESA rails.
                """
)
public enum TransactionMethod {
    @Schema(description = "Customer authorizes an M-PESA STK push prompt.")
    stk_push,

    @Schema(description = "Business-to-customer M-PESA payment.")
    b2c,

    @Schema(description = "Customer-to-business M-PESA payment.")
    c2b,

    @Schema(description = "Business-to-business M-PESA payment.")
    b2b,

    @Schema(description = "Cash payment handled outside M-PESA rails.")
    cash
}
