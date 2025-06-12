# E-commerce API Endpoints

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication Required Headers
```
Authorization: Bearer {jwt_token}
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

### Login User  
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York", 
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

---

## 📦 Product Endpoints

### Get Products (with filtering)
```http
GET /products?page=1&limit=10&category=electronics&search=phone&minPrice=100&maxPrice=1000&sortBy=price&sortOrder=asc
```

### Get Single Product
```http
GET /products/{productId}
```

### Get Featured Products
```http
GET /products/featured?limit=8
```

### Get Products by Category
```http
GET /products/category/{categoryId}?page=1&limit=10
```

### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "iPhone 14",
  "description": "Latest iPhone model with advanced features",
  "price": 999,
  "categoryId": "64a5f8b8c123456789abcdef",
  "images": ["image1.jpg", "image2.jpg"],
  "stock": 50,
  "sku": "IPHONE14PRO"
}
```

### Update Product (Admin Only)
```http
PUT /products/{productId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "iPhone 14 Pro",
  "price": 1099,
  "stock": 25
}
```

### Delete Product (Admin Only)
```http
DELETE /products/{productId}
Authorization: Bearer {admin_token}
```

### Add Product Rating
```http
POST /products/{productId}/rating
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product, highly recommended!"
}
```

---

## 🗂️ Category Endpoints

### Get All Categories
```http
GET /categories
```

### Get Category Hierarchy
```http
GET /categories/hierarchy
```

### Get Categories with Product Count
```http
GET /categories/with-count
```

### Get Single Category
```http
GET /categories/{categoryId}
```

### Create Category (Admin Only)
```http
POST /categories
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "image": "electronics.jpg",
  "parentCategory": null
}
```

### Update Category (Admin Only)
```http
PUT /categories/{categoryId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Consumer Electronics",
  "description": "Updated description"
}
```

### Delete Category (Admin Only)
```http
DELETE /categories/{categoryId}
Authorization: Bearer {admin_token}
```

---

## 🛒 Cart Endpoints (Authentication Required)

### Get User Cart
```http
GET /cart
Authorization: Bearer {token}
```

### Get Cart Item Count
```http
GET /cart/count
Authorization: Bearer {token}
```

### Add Item to Cart
```http
POST /cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "64a5f8b8c123456789abcdef",
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /cart/item/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 5
}
```

### Remove Item from Cart
```http
DELETE /cart/item/{productId}
Authorization: Bearer {token}
```

### Clear Cart
```http
DELETE /cart/clear
Authorization: Bearer {token}
```

---

## 📋 Order Endpoints (Authentication Required)

### Create Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY", 
    "zipCode": "10001",
    "country": "USA"
  },
  "billingAddress": {
    "street": "456 Billing Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002", 
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "notes": "Please deliver after 5 PM"
}
```

### Get User Orders
```http
GET /orders?page=1&limit=10&status=pending
Authorization: Bearer {token}
```

### Get Single Order
```http
GET /orders/{orderId}
Authorization: Bearer {token}
```

### Cancel Order
```http
PUT /orders/{orderId}/cancel
Authorization: Bearer {token}
```

---

## 👑 Admin Order Endpoints (Admin Only)

### Get All Orders
```http
GET /orders/admin/all?page=1&limit=10&status=pending
Authorization: Bearer {admin_token}
```

### Update Order Status
```http
PUT /orders/admin/{orderId}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "shipped",
  "paymentStatus": "completed"
}
```

### Get Order Statistics
```http
GET /orders/admin/stats
Authorization: Bearer {admin_token}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

## 🔢 HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🎯 Order Status Values

**Order Status:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed, preparing for processing
- `processing` - Order being prepared
- `shipped` - Order shipped to customer
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

**Payment Status:**
- `pending` - Payment awaiting processing
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

---

## 🔒 User Roles

- **user** - Regular customer (default)
- **admin** - Administrator with full access

---

## 💡 Usage Examples

### Complete Shopping Flow

1. **Register/Login**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
```

2. **Browse Products**
```bash
curl http://localhost:5000/api/v1/products?category=electronics&limit=5
```

3. **Add to Cart**
```bash
curl -X POST http://localhost:5000/api/v1/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":2}'
```

4. **Create Order**
```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":{...},"paymentMethod":"credit_card"}'
```

### Admin Operations

1. **Create Category**
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic devices"}'
```

2. **Add Product**
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999,"categoryId":"CATEGORY_ID","stock":10,"sku":"LAP001"}'
```

3. **Update Order Status**
```bash
curl -X PUT http://localhost:5000/api/v1/orders/admin/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped","paymentStatus":"completed"}'
```
