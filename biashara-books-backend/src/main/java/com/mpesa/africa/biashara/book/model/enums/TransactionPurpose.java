package com.mpesa.africa.biashara.book.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        description = """
                Business reason for a transaction.
                - expense_payment: Payment for a business expense.
                - sale_payment: Payment received for a sale.
                - loan_payment: Payment related to a loan.
                """
)
public enum TransactionPurpose {
    @Schema(description = "Payment for a business expense.")
    expense_payment,

    @Schema(description = "Payment received for a sale.")
    sale_payment,

    @Schema(description = "Payment related to a loan.")
    loan_payment
}
