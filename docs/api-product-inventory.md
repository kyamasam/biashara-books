# Products & Inventory API

**Base URL:** `http://localhost:8080`  
**Auth:** Bearer token required on all requests — `Authorization: Bearer <token>`

All responses follow this envelope:
```json
{
  "success": true,
  "message": "...",
  "data": { },
  "timestamp": "2026-09-14T10:00:00"
}
```

---

## Flow

Creating a product with pricing is a two-step process:

1. **Create the product** (name, photo, category)
2. **Add inventory to the product** (pricing, stock, physical vs service)

A product can have multiple inventory entries (e.g. same item sold in different units or at different price points).

---

## 1. Create Product

`POST /api/products`

### Request Body

```json
{
  "name": "Fresh Milk",
  "description": "Full cream milk",
  "photoUrl": "https://...",
  "productCategoryId": "uuid-of-category"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | yes | Max 100 chars |
| `description` | string | no | Max 1000 chars |
| `photoUrl` | string | no | Max 500 chars |
| `productCategoryId` | UUID | no | From product categories list |

### Response `201 Created`

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "Fresh Milk",
    "description": "Full cream milk",
    "photoUrl": "https://...",
    "productCategoryId": "uuid-of-category",
    "businessId": "uuid-of-business",
    "userId": "uuid-of-user",
    "createdAt": "2026-09-14T10:00:00",
    "updatedAt": "2026-09-14T10:00:00"
  },
  "timestamp": "2026-09-14T10:00:00"
}
```

Save the returned `id` — you need it to add inventory.

---

## 2. Add Inventory to a Product

`POST /api/inventory`

### Physical Product Example

```json
{
  "productId": "a1b2c3d4-...",
  "inventoryCategory": "physical",
  "inventoryType": "unit",
  "quantity": 50.0,
  "unitMetric": "kg",
  "unitPurchasePrice": 60.0,
  "unitSalePrice": 90.00,
  "priceIncludesTax": false,
  "locationId": "uuid-of-location"
}
```

### Service Product Example

```json
{
  "productId": "a1b2c3d4-...",
  "inventoryCategory": "service",
  "inventoryType": "unit",
  "unitPurchasePrice": 200.0,
  "unitSalePrice": 500.00,
  "priceIncludesTax": false
}
```

> For services, `quantity` and `unitMetric` are omitted. When recording a sale, the quantity on the sale line item determines the amount (e.g. 2 hours × KES 500 = KES 1000).

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `productId` | UUID | yes | ID from step 1 |
| `inventoryCategory` | string | yes | `physical` or `service` |
| `inventoryType` | string | yes | `unit` (fractional, e.g. kg) or `count` (whole units) |
| `quantity` | number | yes if `physical` | Current stock on hand |
| `unitMetric` | string | no | `kg`, `l` — leave blank for services |
| `unitPurchasePrice` | number | yes | Cost price per unit |
| `unitSalePrice` | number | yes | Selling price per unit |
| `priceIncludesTax` | boolean | no | Defaults to `false` |
| `locationId` | UUID | no | Store location if applicable |

### Response `201 Created`

```json
{
  "success": true,
  "message": "Inventory created successfully",
  "data": {
    "id": "inv-uuid-...",
    "productId": "a1b2c3d4-...",
    "inventoryCategory": "physical",
    "inventoryType": "unit",
    "quantity": 50.0,
    "unitMetric": "kg",
    "unitPurchasePrice": 60.0,
    "unitSalePrice": 90.00,
    "priceIncludesTax": false,
    "userId": "uuid-of-user",
    "businessId": "uuid-of-business",
    "locationId": "uuid-of-location",
    "createdAt": "2026-09-14T10:00:00",
    "updatedAt": "2026-09-14T10:00:00"
  },
  "timestamp": "2026-09-14T10:00:00"
}
```

---

## Other Useful Endpoints

### Get All Products (with inventory data)
`GET /api/products?page=1&size=20&name=milk&categoryId=uuid`

Each product in the list includes:
- `totalQuantity` — sum of physical stock across all inventory entries
- `price` — highest sale price across inventory entries
- `inventory` — full list of inventory entries for that product

### Get Product by ID
`GET /api/products/{id}`

### Update Product
`PUT /api/products/{id}` — same body as create

### Delete Product
`DELETE /api/products/{id}` → `204 No Content`

### Get Inventory for a Product
`GET /api/inventory/product/{productId}`

### Update Inventory Entry
`PUT /api/inventory/{id}` — same body as create

### Delete Inventory Entry
`DELETE /api/inventory/{id}` → `204 No Content`

---

## Error Response

```json
{
  "success": false,
  "message": "Quantity is required for physical inventory",
  "timestamp": "2026-09-14T10:00:00"
}
```
