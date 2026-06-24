# Transactions API

Transactions record money moving into or out of a user's business. All transaction endpoints require a Bearer JWT token.

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Base path:

```text
/api/transactions
```

## Create Transaction

```http
POST /api/transactions
```

Creates a transaction for the authenticated user. New transactions are stored with `transactionStatus` set to `initiated`.

### Request Format

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transactionType` | string | Yes | Direction of money movement. |
| `transactionMethod` | string | Yes | Payment flow or settlement method. |
| `transactionPurpose` | string | Yes | Business reason for the transaction. |
| `transactionPurposeDetail` | string | No | Free-text detail for the selected purpose. |
| `confirmationCode` | string | No | External payment confirmation code, such as an M-PESA receipt number. |
| `transactionAmount` | number | Yes | Positive transaction amount. Must be greater than `0`. |
| `paymentChannel` | string | Yes | Account or channel where the payment is collected or sent. |
| `receiverNumber` | string | No | Receiver phone number for outbound payments. |
| `receiverName` | string | No | Receiver display name. |
| `receiverAccount` | string | No | Receiver account reference, such as a PayBill account number or bank account. |
| `senderNumber` | string | No | Sender phone number for incoming payments. |
| `senderName` | string | No | Sender display name. |
| `reconciliationId` | string | No | External reconciliation or checkout request identifier used to match callbacks. |
| `callbackResp` | object | No | Raw callback metadata from the payment provider. |

### Example Request

```json
{
  "transactionType": "credit",
  "transactionMethod": "stk_push",
  "transactionPurpose": "sale_payment",
  "transactionPurposeDetail": "Sale of grocery items",
  "confirmationCode": "SFT7QWERTY",
  "transactionAmount": 1500.00,
  "paymentChannel": "till",
  "receiverNumber": "254712345678",
  "receiverName": "Biashara Shop",
  "receiverAccount": "TILL-123456",
  "senderNumber": "254798765432",
  "senderName": "Kamau Mwangi",
  "reconciliationId": "ws_CO_240620261230001234567890",
  "callbackResp": {
    "provider": "mpesa",
    "resultCode": "0",
    "resultDescription": "Success"
  }
}
```

### Example Response

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "6b989f89-6f14-4f9d-a6c5-f29d14fb7d4c",
    "transactionType": "credit",
    "transactionMethod": "stk_push",
    "transactionPurpose": "sale_payment",
    "transactionPurposeDetail": "Sale of grocery items",
    "confirmationCode": "SFT7QWERTY",
    "transactionAmount": 1500.00,
    "paymentChannel": "till",
    "receiverNumber": "254712345678",
    "receiverName": "Biashara Shop",
    "receiverAccount": "TILL-123456",
    "transactionStatus": "initiated",
    "transactionStatusDetails": "Transaction initiated",
    "senderNumber": "254798765432",
    "senderName": "Kamau Mwangi",
    "reconciliationId": "ws_CO_240620261230001234567890",
    "callbackResp": {
      "provider": "mpesa",
      "resultCode": "0",
      "resultDescription": "Success"
    },
    "userId": "f7f7eacd-07a6-48c3-88fb-6ff41f295050",
    "createdAt": "2026-06-24T12:30:00",
    "updatedAt": "2026-06-24T12:30:00"
  },
  "timestamp": "2026-06-24T12:30:00"
}
```

## Options

### `transactionType`

| Value | Meaning |
|-------|---------|
| `credit` | Money received by the business. |
| `debit` | Money paid out by the business. |

### `transactionMethod`

| Value | Meaning |
|-------|---------|
| `stk_push` | Customer authorizes an M-PESA STK push prompt. |
| `b2c` | Business-to-customer M-PESA payment. |
| `c2b` | Customer-to-business M-PESA payment. |
| `b2b` | Business-to-business M-PESA payment. |
| `cash` | Cash payment handled outside M-PESA rails. |

### `transactionPurpose`

| Value | Meaning |
|-------|---------|
| `expense_payment` | Payment for a business expense. |
| `sale_payment` | Payment received for a sale. |
| `loan_payment` | Payment related to a loan. |

### `paymentChannel`

| Value | Meaning |
|-------|---------|
| `pochi` | M-PESA Pochi la Biashara wallet. |
| `paybill` | M-PESA PayBill account. |
| `till` | M-PESA Buy Goods till. |
| `bank_transfer` | Bank account transfer. |

## Statuses

`transactionStatus` is the processing state of a transaction.

| Status | Meaning | How it is set |
|--------|---------|---------------|
| `initiated` | Transaction has been created and is awaiting confirmation. | Set automatically when a transaction is created. |
| `success` | Transaction completed successfully. | Set with `PATCH /api/transactions/{id}/status`. |
| `failed` | Transaction did not complete successfully. | Set with `PATCH /api/transactions/{id}/status`. |

### Update Status

```http
PATCH /api/transactions/{id}/status?status=success&details=M-PESA%20callback%20confirmed%20payment
```

Query parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | Yes | One of `initiated`, `success`, or `failed`. |
| `details` | string | No | Human-readable status note or provider failure reason. |

Example:

```bash
curl -X PATCH "http://localhost:8080/api/transactions/6b989f89-6f14-4f9d-a6c5-f29d14fb7d4c/status?status=success&details=M-PESA%20callback%20confirmed%20payment" \
  -H "Authorization: Bearer <jwt-token>"
```

## Callback Update

```http
PATCH /api/transactions/{id}/callback?reconciliationId=ws_CO_240620261230001234567890
```

Stores provider callback details against an existing transaction.

Query parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reconciliationId` | string | Yes | External reconciliation or checkout request identifier. |

Request body:

```json
{
  "provider": "mpesa",
  "merchantRequestId": "29115-34620561-1",
  "checkoutRequestId": "ws_CO_240620261230001234567890",
  "resultCode": "0",
  "resultDescription": "The service request is processed successfully."
}
```

## Read Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/transactions` | Returns all transactions for the authenticated user. |
| `GET /api/transactions/{id}` | Returns one transaction if it belongs to the authenticated user. |
| `GET /api/transactions/recent?limit=10` | Returns recent transactions for the authenticated user. `limit` defaults to `10`. |

## Validation and Error Notes

The create request requires `transactionType`, `transactionMethod`, `transactionPurpose`, `transactionAmount`, and `paymentChannel`.

Validation failures return `400 Bad Request` using the standard API response shape:

```json
{
  "success": false,
  "message": "Validation failed: transactionAmount: Transaction amount must be positive",
  "timestamp": "2026-06-24T12:30:00"
}
```

Transactions are scoped to the authenticated user. Reading or updating another user's transaction returns a `400 Bad Request` with:

```json
{
  "success": false,
  "message": "Transaction not found or access denied",
  "timestamp": "2026-06-24T12:30:00"
}
```
