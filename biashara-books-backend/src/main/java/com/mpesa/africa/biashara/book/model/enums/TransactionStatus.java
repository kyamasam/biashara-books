package com.mpesa.africa.biashara.book.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        description = """
                Processing state of a transaction.
                - initiated: Transaction has been created and is awaiting confirmation.
                - success: Transaction completed successfully.
                - failed: Transaction did not complete successfully.
                """
)
public enum TransactionStatus {
    @Schema(description = "Transaction has been created and is awaiting confirmation.")
    initiated,

    @Schema(description = "Transaction completed successfully.")
    success,

    @Schema(description = "Transaction did not complete successfully.")
    failed
}
