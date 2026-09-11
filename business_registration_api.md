# Business Registration API

## `POST /api/auth/register-business`

Creates a new user account, business, and branch locations in a single atomic request. If any step fails, nothing is saved.

**Authentication:** Not required.

---

## Request

**Content-Type:** `application/json`

```json
{
  "user": {
    "username": "john_doe",
    "email": "john@example.com",
    "phoneCode": "+254",
    "phoneNumber": "712345678",
    "pin": "1234"
  },
  "business": {
    "name": "John's Shop",
    "industryId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "shortCode": "123456",
    "shortCodeType": "till"
  },
  "locations": [
    { "name": "Main Branch", "isDefault": true },
    { "name": "Westlands Branch", "isDefault": false }
  ]
}
```

---

## Fields

### `user` object — required

| Field         | Type   | Required | Rules |
|---------------|--------|----------|-------|
| `username`    | string | yes      | Non-empty |
| `email`       | string | yes      | Valid email format |
| `phoneCode`   | string | yes      | `+254` format — 1–4 digits, optional `+` prefix |
| `phoneNumber` | string | yes      | 7–15 digits, no spaces or dashes |
| `pin`         | string | yes      | 4–6 digits only |

`username`, `email`, and `phoneNumber` must be globally unique. A `400` is returned if any already exist.

---

### `business` object — required

| Field               | Type   | Required | Default   | Notes |
|---------------------|--------|----------|-----------|-------|
| `name`              | string | yes      | —         | Max 100 characters |
| `industryId`        | UUID   | no       | `null`    | ID from the `/api/industries` list |
| `shortCode`         | string | no       | `null`    | M-PESA PayBill / Till number |
| `shortCodeType`     | string | no       | `paybill` | One of: `paybill`, `till`, `pochi`, `bank_transfer`, `cash` |
| `shortcodeBalance`  | number | no       | `0`       | Must be ≥ 0 |
| `shortcodeLoanLimit`| number | no       | `0`       | Must be ≥ 0 |
| `fastdukaApiKey`    | string | no       | `null`    | FastDuka integration key |
| `fastdukaOrgId`     | string | no       | `null`    | FastDuka organisation ID |
| `fastdukaConfigId`  | string | no       | `null`    | FastDuka config ID |

---

### `locations` array — optional

If omitted or empty, a single **"Main Shop"** location is created automatically and set as default.

| Field       | Type    | Required | Default | Notes |
|-------------|---------|----------|---------|-------|
| `name`      | string  | yes      | —       | Non-empty |
| `isDefault` | boolean | no       | `false` | Exactly one location should be `true`. If none are flagged, the first entry becomes the default. |

---

## Response — `201 Created`

```json
{
  "success": true,
  "message": "Business registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userId": "a1b2c3d4-...",
    "username": "john_doe",
    "email": "john@example.com",
    "phoneCode": "+254",
    "phoneNumber": "712345678",
    "business": {
      "id": "f1e2d3c4-...",
      "name": "John's Shop",
      "userId": "a1b2c3d4-...",
      "industryId": "3fa85f64-...",
      "shortCode": "123456",
      "shortCodeType": "till",
      "shortcodeBalance": 0,
      "shortcodeLoanLimit": 0,
      "fastdukaApiKey": null,
      "fastdukaOrgId": null,
      "fastdukaConfigId": null,
      "createdAt": "2026-09-11T10:30:00",
      "updatedAt": "2026-09-11T10:30:00"
    },
    "locations": [
      {
        "id": "b3c4d5e6-...",
        "name": "Main Branch",
        "businessId": "f1e2d3c4-...",
        "isDefault": true,
        "createdAt": "2026-09-11T10:30:00",
        "updatedAt": "2026-09-11T10:30:00"
      },
      {
        "id": "c4d5e6f7-...",
        "name": "Westlands Branch",
        "businessId": "f1e2d3c4-...",
        "isDefault": false,
        "createdAt": "2026-09-11T10:30:00",
        "updatedAt": "2026-09-11T10:30:00"
      }
    ]
  },
  "timestamp": "2026-09-11T10:30:00"
}
```

**Store the `token`** and use it as a Bearer token in the `Authorization` header for all subsequent authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

The token encodes `userId` and `username`. It expires after **24 hours**.

After registration, the user's `currentBusinessId` is automatically set to the new business, and the user's `BusinessUser` record has `currentLocationId` set to the default location.

---

## Error Responses

All errors follow the same envelope:

```json
{
  "success": false,
  "message": "Error description here",
  "timestamp": "2026-09-11T10:30:00"
}
```

### Validation errors — `400 Bad Request`

Returned when required fields are missing or fail format rules:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "user.email": "Invalid email format",
    "user.pin": "PIN must be 4-6 digits",
    "business.name": "Business name is required"
  },
  "timestamp": "2026-09-11T10:30:00"
}
```

### Conflict errors — `400 Bad Request`

| Message | Cause |
|---------|-------|
| `Username already exists` | `user.username` is taken |
| `Email already exists` | `user.email` is taken |
| `Phone number already registered` | `user.phoneNumber` is taken |

### Server error — `500 Internal Server Error`

```json
{
  "success": false,
  "message": "An unexpected error occurred",
  "timestamp": "2026-09-11T10:30:00"
}
```

---

## Minimal Request Example

Only the required fields. Locations default to `"Main Shop"`, `shortCodeType` defaults to `"paybill"`.

```json
{
  "user": {
    "username": "jane",
    "email": "jane@example.com",
    "phoneCode": "+254",
    "phoneNumber": "700111222",
    "pin": "9876"
  },
  "business": {
    "name": "Jane's Kiosk"
  }
}
```

---

## After Registration — Logging In

Since registration uses PIN-only, subsequent logins use:

**`POST /api/auth/login/pin`**

```json
{
  "phoneNumber": "712345678",
  "pin": "1234"
}
```

Response is the same `AuthResponse` shape with a fresh token:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userId": "a1b2c3d4-...",
    "username": "john_doe",
    "email": "john@example.com",
    "phoneCode": "+254",
    "phoneNumber": "712345678"
  }
}
```
