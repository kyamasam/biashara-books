package com.mpesa.africa.biashara.book.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        description = """
                Account or channel where a payment is collected or sent.
                - pochi: M-PESA Pochi la Biashara wallet.
                - paybill: M-PESA PayBill account.
                - till: M-PESA Buy Goods till.
                - bank_transfer: Bank account transfer.
                """
)
public enum PaymentChannel {
    @Schema(description = "M-PESA Pochi la Biashara wallet.")
    pochi,

    @Schema(description = "M-PESA PayBill account.")
    paybill,

    @Schema(description = "M-PESA Buy Goods till.")
    till,

    @Schema(description = "Bank account transfer.")
    bank_transfer,

    @Schema(description = "Physical cash payment.")
    cash
}
