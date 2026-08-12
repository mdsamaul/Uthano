ama# UTHANO API - Complete User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Product Management](#product-management)
5. [Order Management](#order-management)
6. [Cart Management](#cart-management)
7. [Customer Profile](#customer-profile)
8. [Farmer Portal](#farmer-portal)
9. [Admin - Dashboard](#admin-dashboard)
10. [Admin - Farmers](#admin-farmers)
11. [Admin - Farms](#admin-farms)
12. [Admin - Harvests](#admin-harvests)
13. [Admin - Warehouses](#admin-warehouses)
14. [Admin - Inventory](#admin-inventory)
15. [Admin - Quality Checks](#admin-quality-checks)
16. [Admin - Product Reviews](#admin-product-reviews)
17. [Admin - Coupons](#admin-coupons)
18. [Admin - Packaging](#admin-packaging)
19. [Admin - Delivery Agents](#admin-delivery-agents)
20. [Admin - Delivery Zones](#admin-delivery-zones)
21. [Admin - Deliveries](#admin-deliveries)
22. [Admin - Audit Logs](#admin-audit-logs)
23. [Notifications](#notifications)
24. [Error Handling](#error-handling)
25. [Best Practices](#best-practices)

---

## Getting Started

### Base URL
```
http://localhost:8080/api/v1
```

### Headers
All authenticated requests must include:
```
Authorization: Bearer {your_token}
Content-Type: application/json
```

---

## Authentication

### 1. Register a New User
**Endpoint:** `POST /auth/register`

**Description:** Creates a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-08-11T10:00:00.000000Z"
  }
}
```

### 2. Login
**Endpoint:** `POST /auth/login`

**Description:** Authenticates user and returns access token

**Request Body:**
```json
{
  "email": "admin@uthano.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@uthano.com"
    },
    "token": "1|abcdefghijklmnopqrstuvwxyz"
  }
}
```

**Important:** Save the `token` from the response. Use it in subsequent requests as `Bearer {token}`

### 3. Logout
**Endpoint:** `POST /auth/logout`

**Description:** Logs out the current user (invalidates token)

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Get Current User
**Endpoint:** `GET /auth/me`

**Description:** Returns the authenticated user's information

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@uthano.com",
    "roles": ["admin"]
  }
}
```

---

## User Management

### User Roles
- **admin**: Full system access
- **staff**: Limited administrative access
- **warehouse_manager**: Warehouse and inventory management
- **farmer**: Farmer portal access
- **customer**: Customer features (browsing, ordering)

---

## Product Management

### 1. List Products (Public)
**Endpoint:** `GET /products`

**Description:** Lists all active products (public catalog)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `category` (optional): Filter by category ID
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `featured` (optional): Show only featured products (true/false)
- `in_stock` (optional): Show only in-stock products (true/false)
- `district` (optional): Filter by district
- `search` (optional): Search by name or SKU
- `sort_by` (optional): Sort field (name, selling_price, created_at)
- `sort_direction` (optional): Sort direction (asc/desc)

**Example Request:**
```
GET /products?category=1&min_price=50&max_price=200&in_stock=true&page=1&per_page=20
```

**Response:**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 50,
    "last_page": 3
  }
}
```

### 2. View Product (Public)
**Endpoint:** `GET /products/{id}`

**Description:** Get detailed information about a specific product

**Response:**
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "id": 1,
    "name": "Fresh Mango",
    "slug": "fresh-mango",
    "description": "Premium quality mango from Khulna",
    "selling_price": 100,
    "category": {
      "id": 1,
      "name": "Fruits"
    },
    "images": [...],
    "average_rating": 4.5
  }
}
```

### 3. Create Product (Admin)
**Endpoint:** `POST /admin/products`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "category_id": 1,
  "unit_id": 1,
  "name": "Fresh Mango",
  "slug": "fresh-mango",
  "sku": "UTH-MANGO-001",
  "product_type": "FRESH",
  "base_price": 80,
  "selling_price": 100,
  "cost_price": 60,
  "minimum_order_quantity": 1,
  "maximum_order_quantity": 100,
  "status": "ACTIVE",
  "is_featured": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {...}
}
```

### 4. Update Product (Admin)
**Endpoint:** `PUT /admin/products/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Mango",
  "selling_price": 120
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {...}
}
```

### 5. Delete Product (Admin)
**Endpoint:** `DELETE /admin/products/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Order Management

### 1. Create Order
**Endpoint:** `POST /orders`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "address_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "payment_method": "COD",
  "notes": "Please deliver before 6 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": 1,
    "order_number": "ORD-2026-001",
    "total": 300,
    "order_status": "PENDING",
    "items": [...]
  }
}
```

### 2. List My Orders
**Endpoint:** `GET /orders`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number
- `per_page` (optional): Items per page
- `status` (optional): Filter by order status
- `payment_status` (optional): Filter by payment status
- `from` (optional): Start date (YYYY-MM-DD)
- `to` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Orders fetched successfully",
  "data": [...]
}
```

### 3. View Order
**Endpoint:** `GET /orders/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Order fetched successfully",
  "data": {
    "id": 1,
    "order_number": "ORD-2026-001",
    "customer": {...},
    "address": {...},
    "items": [...],
    "status_histories": [...],
    "delivery": {...}
  }
}
```

### 4. Cancel Order
**Endpoint:** `POST /orders/{id}/cancel`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Need to change delivery address"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {...}
}
```

### 5. Confirm Order (Admin)
**Endpoint:** `POST /admin/orders/{id}/confirm`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Order confirmed successfully",
  "data": {...}
}
```

### 6. Update Order Status (Admin)
**Endpoint:** `POST /admin/orders/{id}/status`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "PROCESSING",
  "notes": "Order is being prepared"
}
```

**Valid Status Values:**
- PENDING
- CONFIRMED
- PROCESSING
- SHIPPED
- DELIVERED
- CANCELLED

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {...}
}
```

---

## Cart Management

### 1. View Cart
**Endpoint:** `GET /cart`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Fresh Mango",
          "selling_price": 100
        },
        "quantity": 2,
        "subtotal": 200
      }
    ],
    "total": 200
  }
}
```

### 2. Add to Cart
**Endpoint:** `POST /cart/items`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {...}
}
```

### 3. Update Cart Item
**Endpoint:** `PUT /cart/items/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {...}
}
```

### 4. Remove Cart Item
**Endpoint:** `DELETE /cart/items/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

### 5. Clear Cart
**Endpoint:** `DELETE /cart`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## Customer Profile

### 1. Get Profile
**Endpoint:** `GET /customer/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "customer_code": "CUS-001",
    "full_name": "John Doe",
    "phone": "01700000000",
    "addresses": [...]
  }
}
```

### 2. Update Profile
**Endpoint:** `PUT /customer/profile`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "phone": "01711111111",
  "alternate_phone": "01822222222"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {...}
}
```

### 3. List Addresses
**Endpoint:** `GET /customer/addresses`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Addresses fetched successfully",
  "data": [...]
}
```

### 4. Add Address
**Endpoint:** `POST /customer/addresses`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "address_type": "HOME",
  "full_name": "John Doe",
  "phone": "01700000000",
  "address": "123 Main Street",
  "area": "Dhanmondi",
  "city": "Dhaka",
  "district": "Dhaka",
  "postal_code": "1205",
  "is_default": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {...}
}
```

---

## Farmer Portal

**Access:** Requires `farmer` role

### 1. Farmer Dashboard
**Endpoint:** `GET /farmer/dashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard fetched successfully",
  "data": {
    "total_farms": 2,
    "total_harvests": 15,
    "total_earnings": 50000,
    "recent_harvests": [...]
  }
}
```

### 2. My Farms
**Endpoint:** `GET /farmer/farms`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Farms fetched successfully",
  "data": [...]
}
```

### 3. My Harvests
**Endpoint:** `GET /farmer/harvests`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Harvests fetched successfully",
  "data": [...]
}
```

### 4. My Sourcing Records
**Endpoint:** `GET /farmer/sourcing-records`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Sourcing records fetched successfully",
  "data": [...]
}
```

### 5. My Earnings
**Endpoint:** `GET /farmer/earnings`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Earnings fetched successfully",
  "data": {
    "total_earnings": 50000,
    "pending_payments": 5000,
    "completed_payments": 45000,
    "transactions": [...]
  }
}
```

---

## Admin - Dashboard

**Access:** Requires `admin`, `staff`, or `warehouse_manager` role

### Dashboard Summary
**Endpoint:** `GET /admin/dashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard summary fetched successfully",
  "data": {
    "total_orders": 150,
    "total_customers": 80,
    "total_products": 45,
    "total_revenue": 250000,
    "pending_orders": 12,
    "recent_orders": [...],
    "top_products": [...]
  }
}
```

---

## Admin - Farmers

### 1. List Farmers
**Endpoint:** `GET /admin/farmers`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`, `per_page`: Pagination
- `search`: Search by name or phone
- `status`: Filter by status (ACTIVE, INACTIVE)

**Response:**
```json
{
  "success": true,
  "message": "Farmers fetched successfully",
  "data": [...]
}
```

### 2. Create Farmer
**Endpoint:** `POST /admin/farmers`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "Rahim Ahmed",
  "phone": "01700000002",
  "email": "rahim@example.com",
  "password": "password123",
  "national_id": "1234567890",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Farmer created successfully",
  "data": {...}
}
```

### 3. View Farmer
**Endpoint:** `GET /admin/farmers/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Farmer fetched successfully",
  "data": {
    "id": 1,
    "full_name": "Rahim Ahmed",
    "phone": "01700000002",
    "farms": [...],
    "sourcing_records": [...]
  }
}
```

### 4. Update Farmer
**Endpoint:** `PUT /admin/farmers/{id}`

**Request Body:**
```json
{
  "full_name": "Rahim Ahmed Updated",
  "status": "INACTIVE"
}
```

### 5. Delete Farmer
**Endpoint:** `DELETE /admin/farmers/{id}`

---

## Admin - Farms

### 1. List Farms
**Endpoint:** `GET /admin/farms`

**Response:**
```json
{
  "success": true,
  "message": "Farms fetched successfully",
  "data": [...]
}
```

### 2. Create Farm
**Endpoint:** `POST /admin/farms`

**Request Body:**
```json
{
  "farmer_id": 1,
  "farm_name": "Rahim Agro Farm",
  "division": "Khulna",
  "district": "Jhenaidah",
  "upazila": "Kaliganj",
  "village": "Barobazar",
  "address": "Village Barobazar, Kaliganj, Jhenaidah",
  "land_area": 5.5,
  "land_area_unit": "bigha",
  "status": "ACTIVE"
}
```

---

## Admin - Harvests

### 1. List Harvests
**Endpoint:** `GET /admin/harvests`

### 2. Create Harvest
**Endpoint:** `POST /admin/harvests`

**Request Body:**
```json
{
  "farm_id": 1,
  "product_id": 1,
  "harvest_date": "2026-08-10",
  "estimated_quantity": 500,
  "actual_quantity": 500,
  "quantity_unit_id": 1,
  "quality_grade": "A",
  "status": "BATCHED"
}
```

---

## Admin - Warehouses

### 1. List Warehouses
**Endpoint:** `GET /admin/warehouses`

### 2. Create Warehouse
**Endpoint:** `POST /admin/warehouses`

**Request Body:**
```json
{
  "name": "Jhenaidah Collection Center",
  "type": "COLLECTION_CENTER",
  "address": "Kaliganj, Jhenaidah",
  "district": "Jhenaidah",
  "area": "Kaliganj",
  "status": "ACTIVE"
}
```

---

## Admin - Inventory

### 1. List Inventory
**Endpoint:** `GET /admin/inventory`

**Query Parameters:**
- `warehouse_id`: Filter by warehouse
- `product_id`: Filter by product
- `search`: Search by product name

### 2. View Inventory Item
**Endpoint:** `GET /admin/inventory/{id}`

### 3. Adjust Inventory
**Endpoint:** `POST /admin/inventory/{id}/adjust`

**Request Body:**
```json
{
  "quantity": 10,
  "movement_type": "ADJUSTMENT",
  "notes": "Stock adjustment after audit"
}
```

**Movement Types:**
- ADJUSTMENT
- RECEIVED
- DISPATCHED
- TRANSFER
- WASTAGE

### 4. Transfer Inventory
**Endpoint:** `POST /admin/inventory/transfer`

**Request Body:**
```json
{
  "inventory_item_id": 1,
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "quantity": 50
}
```

### 5. View Movements
**Endpoint:** `GET /admin/inventory/{id}/movements`

### 6. Traceability
**Endpoint:** `GET /traceability/{orderItemId}`

---

## Admin - Quality Checks

### 1. List Quality Checks
**Endpoint:** `GET /admin/quality-checks`

**Query Parameters:**
- `product_id`: Filter by product
- `warehouse_id`: Filter by warehouse
- `status`: Filter by status (PENDING, APPROVED, REJECTED)
- `grade`: Filter by grade (A, B, C)
- `from`, `to`: Date range filter

**Response:**
```json
{
  "success": true,
  "message": "Quality checks fetched successfully",
  "data": [
    {
      "id": 1,
      "product": {...},
      "warehouse": {...},
      "appearance": "Good",
      "freshness": "Fresh",
      "grade": "A",
      "status": "APPROVED"
    }
  ]
}
```

### 2. Create Quality Check
**Endpoint:** `POST /admin/quality-checks`

**Request Body:**
```json
{
  "product_id": 1,
  "harvest_batch_id": 1,
  "warehouse_id": 1,
  "appearance": "Good",
  "freshness": "Fresh",
  "damaged_quantity": 0,
  "accepted_quantity": 100,
  "rejected_quantity": 0,
  "grade": "A",
  "status": "PENDING",
  "notes": "Excellent quality produce"
}
```

### 3. View Quality Check
**Endpoint:** `GET /admin/quality-checks/{id}`

### 4. Update Quality Check
**Endpoint:** `PUT /admin/quality-checks/{id}`

### 5. Delete Quality Check
**Endpoint:** `DELETE /admin/quality-checks/{id}`

### 6. Approve Quality Check
**Endpoint:** `POST /admin/quality-checks/{id}/approve`

**Response:**
```json
{
  "success": true,
  "message": "Quality check approved successfully",
  "data": {
    "id": 1,
    "status": "APPROVED"
  }
}
```

### 7. Reject Quality Check
**Endpoint:** `POST /admin/quality-checks/{id}/reject`

**Request Body:**
```json
{
  "reason": "Does not meet quality standards"
}
```

---

## Admin - Product Reviews

### 1. List Product Reviews
**Endpoint:** `GET /admin/product-reviews`

**Query Parameters:**
- `product_id`: Filter by product
- `customer_id`: Filter by customer
- `status`: Filter by status (PENDING, APPROVED, REJECTED)
- `rating`: Filter by rating (1-5)
- `from`, `to`: Date range filter

**Response:**
```json
{
  "success": true,
  "message": "Product reviews fetched successfully",
  "data": [
    {
      "id": 1,
      "customer": {...},
      "product": {...},
      "rating": 5,
      "title": "Great product",
      "comment": "Excellent quality",
      "status": "APPROVED"
    }
  ]
}
```

### 2. Create Product Review
**Endpoint:** `POST /admin/product-reviews`

**Request Body:**
```json
{
  "product_id": 1,
  "customer_id": 1,
  "order_id": 1,
  "order_item_id": 1,
  "rating": 5,
  "title": "Great product",
  "comment": "Excellent quality",
  "status": "PENDING"
}
```

**Rating:** 1-5 stars

### 3. View Product Review
**Endpoint:** `GET /admin/product-reviews/{id}`

### 4. Update Product Review
**Endpoint:** `PUT /admin/product-reviews/{id}`

### 5. Delete Product Review
**Endpoint:** `DELETE /admin/product-reviews/{id}`

### 6. Approve Product Review
**Endpoint:** `POST /admin/product-reviews/{id}/approve`

### 7. Reject Product Review
**Endpoint:** `POST /admin/product-reviews/{id}/reject`

**Request Body:**
```json
{
  "reason": "Inappropriate content"
}
```

---

## Admin - Coupons

### 1. List Coupons
**Endpoint:** `GET /admin/coupons`

**Query Parameters:**
- `is_active`: Filter by active status
- `type`: Filter by type (PERCENTAGE, FIXED)
- `search`: Search by coupon code

**Response:**
```json
{
  "success": true,
  "message": "Coupons fetched successfully",
  "data": [
    {
      "id": 1,
      "code": "TEST20",
      "type": "PERCENTAGE",
      "value": 20,
      "minimum_order_amount": 100,
      "start_at": "2026-08-11T00:00:00.000000Z",
      "end_at": "2026-09-11T00:00:00.000000Z",
      "usage_limit": 100,
      "is_active": true
    }
  ]
}
```

### 2. Create Coupon
**Endpoint:** `POST /admin/coupons`

**Request Body:**
```json
{
  "code": "TEST20",
  "type": "PERCENTAGE",
  "value": 20,
  "minimum_order_amount": 100,
  "maximum_discount": 50,
  "start_at": "2026-08-11",
  "end_at": "2026-09-11",
  "usage_limit": 100,
  "per_customer_limit": 1,
  "is_active": true
}
```

**Coupon Types:**
- `PERCENTAGE`: Percentage discount (value = percentage)
- `FIXED`: Fixed amount discount (value = amount)

### 3. View Coupon
**Endpoint:** `GET /admin/coupons/{id}`

### 4. Update Coupon
**Endpoint:** `PUT /admin/coupons/{id}`

### 5. Delete Coupon
**Endpoint:** `DELETE /admin/coupons/{id}`

### 6. Toggle Coupon Status
**Endpoint:** `POST /admin/coupons/{id}/toggle`

**Response:**
```json
{
  "success": true,
  "message": "Coupon status updated successfully",
  "data": {
    "id": 1,
    "is_active": false
  }
}
```

---

## Admin - Packaging

### Packaging Types

#### 1. List Packaging Types
**Endpoint:** `GET /admin/packaging-types`

**Response:**
```json
{
  "success": true,
  "message": "Packaging types fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Standard Box",
      "code": "BOX-STD",
      "capacity": 10,
      "capacity_unit": "kg",
      "is_reusable": false
    }
  ]
}
```

#### 2. Create Packaging Type
**Endpoint:** `POST /admin/packaging-types`

**Request Body:**
```json
{
  "name": "Standard Box",
  "code": "BOX-STD",
  "description": "Standard packaging box",
  "capacity": 10,
  "capacity_unit": "kg",
  "is_reusable": false,
  "is_active": true
}
```

#### 3. View Packaging Type
**Endpoint:** `GET /admin/packaging-types/{id}`

#### 4. Update Packaging Type
**Endpoint:** `PUT /admin/packaging-types/{id}`

#### 5. Delete Packaging Type
**Endpoint:** `DELETE /admin/packaging-types/{id}`

#### 6. Toggle Packaging Type Status
**Endpoint:** `POST /admin/packaging-types/{id}/toggle`

### Packaging Items

#### 1. List Packaging Items
**Endpoint:** `GET /admin/packaging-items`

**Query Parameters:**
- `packaging_type_id`: Filter by type
- `warehouse_id`: Filter by warehouse
- `status`: Filter by status (AVAILABLE, IN_USE, DAMAGED, RETIRED)
- `search`: Search by code

**Response:**
```json
{
  "success": true,
  "message": "Packaging items fetched successfully",
  "data": [
    {
      "id": 1,
      "packaging_type": {...},
      "warehouse": {...},
      "code": "BOX-001",
      "status": "AVAILABLE"
    }
  ]
}
```

#### 2. Create Packaging Item
**Endpoint:** `POST /admin/packaging-items`

**Request Body:**
```json
{
  "packaging_type_id": 1,
  "warehouse_id": 1,
  "code": "BOX-001",
  "status": "AVAILABLE",
  "notes": "New packaging item"
}
```

#### 3. View Packaging Item
**Endpoint:** `GET /admin/packaging-items/{id}`

#### 4. Update Packaging Item
**Endpoint:** `PUT /admin/packaging-items/{id}`

#### 5. Delete Packaging Item
**Endpoint:** `DELETE /admin/packaging-items/{id}`

#### 6. View Packaging Movements
**Endpoint:** `GET /admin/packaging-items/{id}/movements`

**Response:**
```json
{
  "success": true,
  "message": "Packaging movements fetched successfully",
  "data": [
    {
      "id": 1,
      "movement_type": "DISPATCHED",
      "quantity": 10,
      "notes": "Dispatched for order #123"
    }
  ]
}
```

---

## Admin - Delivery Agents

### 1. List Delivery Agents
**Endpoint:** `GET /admin/delivery-agents`

**Query Parameters:**
- `status`: Filter by status (ACTIVE, INACTIVE, ON_DELIVERY)
- `vehicle_type`: Filter by vehicle type
- `search`: Search by agent code, phone, or name

**Response:**
```json
{
  "success": true,
  "message": "Delivery agents fetched successfully",
  "data": [
    {
      "id": 1,
      "user": {
        "name": "Karim Ahmed"
      },
      "agent_code": "AGENT-001",
      "phone": "01700000001",
      "vehicle_type": "Motorcycle",
      "vehicle_number": "DHK-1234",
      "status": "ACTIVE"
    }
  ]
}
```

### 2. Create Delivery Agent
**Endpoint:** `POST /admin/delivery-agents`

**Request Body:**
```json
{
  "user_id": 1,
  "agent_code": "AGENT-001",
  "phone": "01700000001",
  "vehicle_type": "Motorcycle",
  "vehicle_number": "DHK-1234",
  "status": "ACTIVE"
}
```

**Vehicle Types:**
- Motorcycle
- Bicycle
- Van
- Truck

### 3. View Delivery Agent
**Endpoint:** `GET /admin/delivery-agents/{id}`

### 4. Update Delivery Agent
**Endpoint:** `PUT /admin/delivery-agents/{id}`

### 5. Delete Delivery Agent
**Endpoint:** `DELETE /admin/delivery-agents/{id}`

### 6. Toggle Agent Status
**Endpoint:** `POST /admin/delivery-agents/{id}/toggle`

---

## Admin - Delivery Zones

### 1. List Delivery Zones
**Endpoint:** `GET /admin/delivery-zones`

**Query Parameters:**
- `status`: Filter by status (ACTIVE, INACTIVE)
- `district`: Filter by district
- `search`: Search by name or area

**Response:**
```json
{
  "success": true,
  "message": "Delivery zones fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Dhaka Central",
      "district": "Dhaka",
      "area": "Dhanmondi, Mohammadpur",
      "base_charge": 50,
      "weight_based_charge": 10,
      "status": "ACTIVE"
    }
  ]
}
```

### 2. Create Delivery Zone
**Endpoint:** `POST /admin/delivery-zones`

**Request Body:**
```json
{
  "name": "Dhaka Central",
  "district": "Dhaka",
  "area": "Dhanmondi, Mohammadpur",
  "base_charge": 50,
  "weight_based_charge": 10,
  "status": "ACTIVE"
}
```

### 3. View Delivery Zone
**Endpoint:** `GET /admin/delivery-zones/{id}`

### 4. Update Delivery Zone
**Endpoint:** `PUT /admin/delivery-zones/{id}`

### 5. Delete Delivery Zone
**Endpoint:** `DELETE /admin/delivery-zones/{id}`

### 6. Toggle Zone Status
**Endpoint:** `POST /admin/delivery-zones/{id}/toggle`

---

## Admin - Deliveries

### 1. List Deliveries
**Endpoint:** `GET /admin/deliveries`

**Query Parameters:**
- `status`: Filter by delivery status
- `delivery_agent_id`: Filter by agent
- `from`, `to`: Date range filter

### 2. Create Delivery
**Endpoint:** `POST /admin/deliveries`

**Request Body:**
```json
{
  "order_id": 1,
  "delivery_zone_id": 1,
  "pickup_warehouse_id": 1,
  "delivery_agent_id": 1,
  "delivery_fee": 50,
  "notes": "Fragile items"
}
```

### 3. View Delivery
**Endpoint:** `GET /admin/deliveries/{id}`

### 4. Assign Delivery Agent
**Endpoint:** `POST /admin/deliveries/{id}/assign`

**Request Body:**
```json
{
  "delivery_agent_id": 1
}
```

### 5. Update Delivery Status
**Endpoint:** `POST /admin/deliveries/{id}/status`

**Request Body:**
```json
{
  "status": "IN_TRANSIT",
  "notes": "Out for delivery"
}
```

**Delivery Statuses:**
- PENDING
- ASSIGNED
- IN_TRANSIT
- DELIVERED
- FAILED

---

## Admin - Audit Logs

### 1. List Audit Logs
**Endpoint:** `GET /admin/audit-logs`

**Query Parameters:**
- `user_id`: Filter by user
- `action`: Search by action
- `auditable_type`: Filter by model type
- `auditable_id`: Filter by model ID
- `from`, `to`: Date range filter

**Response:**
```json
{
  "success": true,
  "message": "Audit logs fetched successfully",
  "data": [
    {
      "id": 1,
      "user": {
        "name": "Admin User"
      },
      "action": "updated",
      "auditable_type": "App\\Models\\Product",
      "auditable_id": 1,
      "old_values": {...},
      "new_values": {...},
      "ip_address": "127.0.0.1"
    }
  ]
}
```

### 2. View Audit Log
**Endpoint:** `GET /admin/audit-logs/{id}`

### 3. Delete Audit Log
**Endpoint:** `DELETE /admin/audit-logs/{id}`

### 4. Cleanup Old Logs
**Endpoint:** `DELETE /admin/audit-logs/cleanup`

**Query Parameters:**
- `days`: Delete logs older than X days (default: 90)

**Example:**
```
DELETE /admin/audit-logs/cleanup?days=30
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 150 old audit logs"
}
```

---

## Notifications

### 1. List Notifications
**Endpoint:** `GET /notifications`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `read`: Filter by read status (true/false)
- `type`: Filter by notification type
- `page`, `per_page`: Pagination

**Response:**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": 1,
      "type": "order",
      "title": "Order Confirmed",
      "body": "Your order #123 has been confirmed",
      "read_at": null
    }
  ]
}
```

### 2. View Notification
**Endpoint:** `GET /notifications/{id}`

**Note:** Automatically marks notification as read

### 3. Mark as Read
**Endpoint:** `POST /notifications/{id}/read`

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 4. Mark All as Read
**Endpoint:** `POST /notifications/read-all`

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### 5. Unread Count
**Endpoint:** `GET /notifications/unread-count`

**Response:**
```json
{
  "success": true,
  "message": "Unread notifications count",
  "data": {
    "count": 5
  }
}
```

### 6. Delete Notification
**Endpoint:** `DELETE /notifications/{id}`

### 7. Delete All Notifications
**Endpoint:** `DELETE /notifications`

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Validation Error`: Validation failed
- `500 Server Error`: Internal server error

### Example Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

---

## Best Practices

### 1. Authentication
- Always store tokens securely
- Use HTTPS in production
- Refresh tokens when expired
- Never share tokens

### 2. API Requests
- Include proper headers
- Use correct HTTP methods (GET, POST, PUT, DELETE)
- Send request body as JSON
- Handle errors gracefully

### 3. Data Validation
- Validate data on client-side before sending
- Check required fields
- Validate data formats (email, phone, etc.)
- Handle validation errors

### 4. Performance
- Use pagination for large datasets
- Cache frequently accessed data
- Minimize API calls
- Use filters to reduce data transfer

### 5. Security
- Never expose sensitive data in logs
- Use strong passwords
- Implement rate limiting
- Regularly rotate API keys

---

## Support

For API support:
- Email: support@uthano.com
- Documentation: http://localhost:8000/api/documentation
- Postman Collection: Import `postman/UTHANO_API_Collection.json`

---

## Changelog

### Version 1.0.0 (2026-08-11)
- Initial API release
- User authentication and authorization
- Product catalog and management
- Order and cart management
- Delivery management
- Quality checks and reviews
- Coupon system
- Packaging management
- Notifications
- Audit logs
- Swagger documentation
- Docker setup