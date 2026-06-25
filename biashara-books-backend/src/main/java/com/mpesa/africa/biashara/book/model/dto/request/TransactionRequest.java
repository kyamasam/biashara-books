package com.mpesa.africa.biashara.book.model.dto.request;

import com.mpesa.africa.biashara.book.model.enums.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Payload used to record or initiate a business transaction.")
public class TransactionRequest {
    @Schema(description = "Business ID to attach this transaction to. If omitted, the authenticated user's current business is used.")
    private UUID businessId;

    @NotNull(message = "Transaction type is required")
    @Schema(
            description = """
                    Direction of money movement.
                    Options:
                    - credit: Money received by the business.
                    - debit: Money paid out by the business.
                    """,
            example = "credit",
            allowableValues = {"credit", "debit"}
    )
    private TransactionType transactionType;

    @NotNull(message = "Transaction method is required")
    @Schema(
            description = """
                    Payment flow or settlement method used for the transaction.
                    Options:
                    - stk_push: Customer authorizes an M-PESA STK push prompt.
                    - b2c: Business-to-customer M-PESA payment.
                    - c2b: Customer-to-business M-PESA payment.
                    - b2b: Business-to-business M-PESA payment.
                    - cash: Cash payment handled outside M-PESA rails.
                    """,
            example = "stk_push",
            allowableValues = {"stk_push", "b2c", "c2b", "b2b", "cash"}
    )
    private TransactionMethod transactionMethod;

    @NotNull(message = "Transaction purpose is required")
    @Schema(
            description = """
                    Business reason for the transaction.
                    Options:
                    - expense_payment: Payment for a business expense.
                    - sale_payment: Payment received for a sale.
                    - loan_payment: Payment related to a loan.
                    """,
            example = "expense_payment",
            allowableValues = {"expense_payment", "sale_payment", "loan_payment"}
    )
    private TransactionPurpose transactionPurpose;

    @Schema(description = "Optional free-text detail that further explains the selected transaction purpose.", example = "Monthly shop rent")
    private String transactionPurposeDetail;

    @Schema(description = "External payment confirmation code, such as an M-PESA receipt number.", example = "SFT7QWERTY")
    private String confirmationCode;

    @NotNull(message = "Transaction amount is required")
    @Positive(message = "Transaction amount must be positive")
    @Schema(description = "Positive transaction amount.", example = "1500.00")
    private BigDecimal transactionAmount;

    @NotNull(message = "Payment channel is required")
    @Schema(
            description = """
                    Account or channel where the payment is collected or sent.
                    Options:
                    - pochi: M-PESA Pochi la Biashara wallet.
                    - paybill: M-PESA PayBill account.
                    - till: M-PESA Buy Goods till.
                    - bank_transfer: Bank account transfer.
                    - cash: Physical cash payment (no M-PESA channel).
                    """,
            example = "pochi",
            allowableValues = {"pochi", "paybill", "till", "bank_transfer", "cash"}
    )
    private PaymentChannel paymentChannel;

    @Schema(description = "Receiver phone number for transactions sent to a customer or business contact.", example = "254712345678")
    private String receiverNumber;

    @Schema(description = "Receiver display name.", example = "Amina Otieno")
    private String receiverName;

    @Schema(description = "Receiver account reference, such as a PayBill account number or bank account.", example = "ACC-10001")
    private String receiverAccount;

    @Schema(description = "Sender phone number for incoming transactions.", example = "254798765432")
    private String senderNumber;

    @Schema(description = "Sender display name.", example = "Kamau Mwangi")
    private String senderName;

    @Schema(description = "External reconciliation or checkout request identifier used to match callbacks.", example = "ws_CO_240620261230001234567890")
    private String reconciliationId;

    @Schema(description = "Raw callback response metadata from the payment provider.")
    private Map<String, Object> callbackResp;
}
