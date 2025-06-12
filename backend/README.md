# E-commerce Backend API

A complete REST API for an e-commerce application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Product Management**: CRUD operations, categories, ratings, search, filtering
- **Shopping Cart**: Add, update, remove items with real-time stock validation
- **Order Processing**: Complete order lifecycle with status tracking
- **Category Management**: Hierarchical categories with subcategories
- **Security**: Helmet, CORS, input validation, password hashing
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS
- **Development**: Nodemon, ts-node

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:4200
   BCRYPT_ROUNDS=12
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prod` - Build and start production server
- `npm run clean` - Remove build directory

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
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

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer {token}
```

#### Update Profile (Protected)
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

### Product Endpoints

#### Get Products
```http
GET /products?page=1&limit=10&category=electronics&search=phone&minPrice=100&maxPrice=1000&sortBy=price&sortOrder=asc
```

#### Get Single Product
```http
GET /products/{id}
```

#### Get Featured Products
```http
GET /products/featured?limit=8
```

#### Get Products by Category
```http
GET /products/category/{categoryId}?page=1&limit=10
```

#### Create Product (Admin)
```http
POST /products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "iPhone 14",
  "description": "Latest iPhone model",
  "price": 999,
  "categoryId": "category_id_here",
  "images": ["image1.jpg", "image2.jpg"],
  "stock": 50,
  "sku": "IPHONE14"
}
```

#### Add Product Rating (Protected)
```http
POST /products/{id}/rating
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product!"
}
```

### Category Endpoints

#### Get Categories
```http
GET /categories
```

#### Get Category Hierarchy
```http
GET /categories/hierarchy
```

#### Get Categories with Product Count
```http
GET /categories/with-count
```

#### Create Category (Admin)
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

### Cart Endpoints (All Protected)

#### Get Cart
```http
GET /cart
Authorization: Bearer {token}
```

#### Add to Cart
```http
POST /cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id_here",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /cart/item/{productId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /cart/item/{productId}
Authorization: Bearer {token}
```

#### Get Cart Item Count
```http
GET /cart/count
Authorization: Bearer {token}
```

### Order Endpoints (All Protected)

#### Create Order
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
  "paymentMethod": "credit_card",
  "notes": "Please deliver after 5 PM"
}
```

#### Get User Orders
```http
GET /orders?page=1&limit=10&status=pending
Authorization: Bearer {token}
```

#### Get Single Order
```http
GET /orders/{id}
Authorization: Bearer {token}
```

#### Cancel Order
```http
PUT /orders/{id}/cancel
Authorization: Bearer {token}
```

#### Get All Orders (Admin)
```http
GET /orders/admin/all?page=1&limit=10&status=pending
Authorization: Bearer {admin_token}
```

#### Update Order Status (Admin)
```http
PUT /orders/admin/{id}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "shipped",
  "paymentStatus": "completed"
}
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "ERROR_CODE"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

### User
- firstName, lastName, email, password
- phone, address, role, isActive
- Timestamps

### Product
- name, description, price, category
- categoryId, images, stock, sku
- ratings, averageRating, isActive
- Timestamps

### Category
- name, description, image
- parentCategory, isActive
- Timestamps

### Cart
- userId, items[], totalAmount
- Timestamps

### Order
- userId, orderNumber, items[]
- totalAmount, status, paymentStatus
- shippingAddress, billingAddress
- paymentMethod, notes
- Timestamps

## Security Features

- JWT authentication with expiry
- Password hashing with bcrypt
- Role-based authorization
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Rate limiting ready (can be added)

## Error Handling

- Comprehensive error handling middleware
- MongoDB error handling
- JWT error handling
- Validation error handling
- Async error handling wrapper

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
