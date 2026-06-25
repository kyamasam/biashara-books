# M-Pesa B2B Integration Guide

Business-to-Business (B2B) payments allow your platform to send money from a business shortcode to another paybill number. The transaction moves funds from your MMF/Working account to the recipient's utility account.

---

## Prerequisites

Before initiating a B2B payment the source account must have an `MpesaAccountConfig` row with these fields populated:

| Field | Description |
|---|---|
| `mpesa_consumer_key` | Daraja API consumer key |
| `mpesa_consumer_secret` | Daraja API consumer secret |
| `business_short_code` | Sender shortcode (PartyA) |
| `initiator` | M-Pesa API operator username (must have *Org Business Pay Bill* role) |
| `security_credential` | Encrypted initiator password issued by Safaricom |
| `callback_url` | _(optional)_ Your server URL — receives the final transaction result as a POST |

---

## Initiate a B2B Payment

```
POST /api/mpesa_b2b/
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "source_account_id": 1,
  "amount": 500,
  "destination_paybill": "000200",
  "account_reference": "INV-2024-001",
  "remarks": "Invoice payment",
  "requester": "254700000000"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `source_account_id` | integer | Yes | ID of the account to debit |
| `amount` | number | Yes | Amount in KES |
| `destination_paybill` | string | Yes | Recipient paybill (PartyB) |
| `account_reference` | string (≤13 chars) | Yes | Bill reference number |
| `remarks` | string (≤100 chars) | Yes | Notes attached to the payment |
| `requester` | string | No | Consumer phone number on whose behalf you are paying (e.g. `254700000000`) |

### Success Response — `201 Created`

Returned immediately after Safaricom accepts the request. The transaction is **not yet settled** at this point.

```json
{
  "id": 42,
  "amount": 500.0,
  "source_account": {
    "id": 1,
    "account_identifier": "123456"
  },
  "destination_paybill": "000200",
  "account_reference": "INV-2024-001",
  "remarks": "Invoice payment",
  "requester": "254700000000",
  "conversation_id": "AG_20230420_2010759fd5662ef6d054",
  "originator_conversation_id": "5118-111210482-1",
  "mpesa_code": "",
  "status": "initiated",
  "response": {
    "OriginatorConversationID": "5118-111210482-1",
    "ConversationID": "AG_20230420_2010759fd5662ef6d054",
    "ResponseCode": "0",
    "ResponseDescription": "Accept the service request successfully."
  },
  "result_description": "",
  "is_success": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

> `is_success: false` at this stage is expected — it updates to `true` once the callback arrives.  
> Save `conversation_id` — it is your key for polling status later.

### Error Responses

| HTTP Status | Scenario | Example `detail` |
|---|---|---|
| `400` | Account has no M-Pesa config | `"Account has no M-Pesa configuration"` |
| `400` | Config missing initiator or credential | `"Account config is missing initiator or security_credential for B2B"` |
| `400` | Daraja rejected the request | `"B2B request failed [400]: Invalid Access Token"` |
| `400` | Serializer validation failed | `{ "amount": ["This field is required."] }` |

---

## Callback (Result) Handling

Safaricom POSTs the final result to `<APP_URL>/api/handle_b2b_callback` asynchronously. You do not need to wire this up — it is handled internally.

On receipt the system:
1. Updates `MpesaB2BInitiate.status` → `processed` or `failed`
2. Saves `mpesa_code` (the M-Pesa transaction ID, e.g. `QKA81LK5CY`)
3. Updates `TransactionV2.transaction_status` and `transaction_confirmation_number`
4. POSTs the final `TransactionV2` payload to your `MpesaAccountConfig.callback_url` if set

### Successful Callback Payload (from Safaricom)

```json
{
  "Result": {
    "ResultType": 0,
    "ResultCode": 0,
    "ResultDesc": "The service request is processed successfully",
    "OriginatorConversationID": "626f6ddf-ab37-4650-b882-b1de92ec9aa4",
    "ConversationID": "AG_20230420_2010759fd5662ef6d054",
    "TransactionID": "QKA81LK5CY",
    "ResultParameters": {
      "ResultParameter": [
        { "Key": "DebitAccountBalance", "Value": "{Amount={CurrencyCode=KES, MinimumAmount=618683, BasicAmount=6186.83}}" },
        { "Key": "Amount", "Value": "500.00" },
        { "Key": "DebitPartyAffectedAccountBalance", "Value": "Working Account|KES|346568.83|6186.83|340382.00|0.00" },
        { "Key": "TransCompletedTime", "Value": "20221110110717" },
        { "Key": "DebitPartyCharges", "Value": "" },
        { "Key": "ReceiverPartyPublicName", "Value": "000200 – Recipient Company" },
        { "Key": "Currency", "Value": "KES" },
        { "Key": "InitiatorAccountCurrentBalance", "Value": "{Amount={CurrencyCode=KES, MinimumAmount=618683, BasicAmount=6186.83}}" }
      ]
    },
    "ReferenceData": {
      "ReferenceItem": [
        { "Key": "BillReferenceNumber", "Value": "INV-2024-001" },
        { "Key": "QueueTimeoutURL", "Value": "https://yourdomain.com/api/handle_b2b_timeout_callback" }
      ]
    }
  }
}
```

### Failed Callback Payload (from Safaricom)

```json
{
  "Result": {
    "ResultType": 0,
    "ResultCode": 2001,
    "ResultDesc": "The initiator information is invalid.",
    "OriginatorConversationID": "12337-23509183-5",
    "ConversationID": "AG_20200120_0000657265d5fa9ae5c0",
    "TransactionID": "OAK0000000",
    "ResultParameters": {
      "ResultParameter": { "Key": "BOCompletedTime", "Value": 20200120164825 }
    },
    "ReferenceData": {
      "ReferenceItem": {
        "Key": "QueueTimeoutURL",
        "Value": "https://internalapi.safaricom.co.ke/mpesa/abresults/v1/submit"
      }
    }
  }
}
```

### Result Codes

| `ResultCode` | Meaning |
|---|---|
| `0` | Success — transaction settled |
| `2001` | Invalid initiator credentials |
| `17` | System internal error — retry |
| `1` | Insufficient funds in source account |
| `26` | Traffic exceeded — retry later |

---

## Poll Transaction Status via TransactionV2

Because callbacks are asynchronous, poll `TransactionV2` to check if the payment has settled.

### Get by `conversation_id`

```
GET /api/transactions_v2/?conversation_id=AG_20230420_2010759fd5662ef6d054
Authorization: Bearer <token>
```

### Get by `invoice_number` (account_reference)

```
GET /api/transactions_v2/?invoice_number=INV-2024-001
Authorization: Bearer <token>
```

### TransactionV2 Response Shape

```json
{
  "count": 1,
  "results": [
    {
      "payment_method": { ... },
      "source_account_number": "123456",
      "destination_account_number": "000200",
      "amount": 500.0,
      "invoice_number": "INV-2024-001",
      "transaction_confirmation_number": "QKA81LK5CY",
      "idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": null,
      "transaction_type": "b2b",
      "transaction_status": "processed",
      "result_desc": "The service request is processed successfully"
    }
  ]
}
```

### `transaction_status` Values

| Value | Meaning |
|---|---|
| `initiated` | Request sent to Safaricom, awaiting callback |
| `processing` | Intermediate state during processing |
| `processed` | Payment settled — `transaction_confirmation_number` is populated |
| `failed` | Payment failed — check `result_desc` for the reason |
| `cancelled` | Payment was cancelled |

### Available Filter Parameters

| Parameter | Example |
|---|---|
| `conversation_id` | `?conversation_id=AG_20230420_...` |
| `invoice_number` | `?invoice_number=INV-2024-001` |
| `transaction_status` | `?transaction_status=processed` |
| `transaction_confirmation_number` | `?transaction_confirmation_number=QKA81LK5CY` |
| `transaction_type` | `?transaction_type=b2b` |
| `amount` | `?amount=500` / `?amount__gte=100&amount__lte=1000` |
| `account` | `?account=1` |

---

## End-to-End Flow Summary

```
Client                     API                      Safaricom
  │                          │                           │
  │  POST /api/mpesa_b2b/    │                           │
  │─────────────────────────>│                           │
  │                          │  POST /mpesa/b2b/v1/      │
  │                          │  paymentrequest           │
  │                          │──────────────────────────>│
  │                          │  { ConversationID, ... }  │
  │                          │<──────────────────────────│
  │  201 { status: initiated,│                           │
  │        conversation_id } │                           │
  │<─────────────────────────│                           │
  │                          │                           │
  │  (poll GET /transactions_v2/?conversation_id=...)    │
  │─────────────────────────>│                           │
  │  { status: initiated }   │                           │
  │<─────────────────────────│                           │
  │                          │   POST /handle_b2b_callback
  │                          │<──────────────────────────│
  │                          │  (updates TransactionV2)  │
  │                          │  (fires callback_url)     │
  │                          │                           │
  │  (poll again)            │                           │
  │─────────────────────────>│                           │
  │  { status: processed,    │                           │
  │    transaction_confirmation_number: "QKA81LK5CY" }   │
  │<─────────────────────────│                           │
```
