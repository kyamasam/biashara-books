package com.mpesa.africa.biashara.book.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        description = """
                Direction of money movement.
                - credit: Money received by the business.
                - debit: Money paid out by the business.
                """
)
public enum TransactionType {
    @Schema(description = "Money received by the business.")
    credit,

    @Schema(description = "Money paid out by the business.")
    debit
}
