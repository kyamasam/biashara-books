class TransactionType:
    CREDIT = "credit"
    DEBIT = "debit"

    choices = [
        (CREDIT, "Credit"),
        (DEBIT, "Debit"),
    ]


class TransactionMethod:
    STK_PUSH = "stk_push"
    B2C = "b2c"
    C2B = "c2b"
    B2B = "b2b"
    CASH = "cash"

    choices = [
        (STK_PUSH, "STK Push"),
        (B2C, "B2C"),
        (C2B, "C2B"),
        (B2B, "B2B"),
        (CASH, "Cash"),
    ]


class TransactionPurpose:
    EXPENSE_PAYMENT = "expense_payment"

    choices = [
        (EXPENSE_PAYMENT, "Expense Payment"),
    ]


class PaymentChannel:
    POCHI = "pochi"
    PAYBILL = "paybill"
    TILL = "till"

    choices = [
        (POCHI, "Pochi"),
        (PAYBILL, "Paybill"),
        (TILL, "Till"),
    ]


class TransactionStatus:
    INITIATED = "initiated"
    SUCCESS = "success"
    FAILED = "failed"

    choices = [
        (INITIATED, "Initiated"),
        (SUCCESS, "Success"),
        (FAILED, "Failed"),
    ]
