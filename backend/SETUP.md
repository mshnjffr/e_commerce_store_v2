# E-commerce Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your MongoDB URI and JWT secret
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test the API**
   ```bash
   curl http://localhost:5000/health
   ```

## Prerequisites

- **Node.js** v16 or higher
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **npm** package manager

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration  
MONGODB_URI=mongodb://localhost:27017/ecommerce
DB_NAME=ecommerce

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:4200

# Password Hashing
BCRYPT_ROUNDS=12
```

## MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service: `mongod`
3. Use URI: `mongodb://localhost:27017/ecommerce`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at mongodb.com/atlas
2. Create cluster and database
3. Get connection string and update MONGODB_URI in `.env`

### Option 3: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript  
- `npm start` - Start production server
- `npm run prod` - Build and start production server
- `npm run clean` - Remove build directory

## API Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com", 
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Creating Admin User

To create an admin user, you can either:

1. **Register normally then update in MongoDB:**
   ```javascript
   // In MongoDB shell or Compass
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Or modify the register endpoint temporarily** to set role to "admin"

## Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── AuthController.ts
│   │   ├── ProductController.ts
│   │   ├── CartController.ts
│   │   ├── OrderController.ts
│   │   └── CategoryController.ts
│   ├── models/              # MongoDB models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Cart.ts
│   │   ├── Order.ts
│   │   └── Category.ts
│   ├── routes/              # API routes
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── cartRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   └── index.ts
│   ├── middleware/          # Custom middleware
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── services/           # Database and external services
│   │   └── database.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── server.ts           # Main server file
├── dist/                   # Built JavaScript files
├── .env                    # Environment variables
├── .env.example           # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
├── SETUP.md               # This file
└── API_ENDPOINTS.md       # API documentation
```

## Database Schema

### Users
- Authentication with JWT
- Role-based access (user/admin)  
- Profile management with addresses

### Products
- Full product catalog
- Categories and subcategories
- Image gallery support
- Stock management
- Customer ratings and reviews

### Shopping Cart
- User-specific carts
- Real-time stock validation
- Automatic price calculations

### Orders
- Complete order lifecycle
- Multiple status tracking
- Payment status management
- Order history

### Categories
- Hierarchical category structure
- Parent-child relationships
- Product count tracking

## Security Features

- **JWT Authentication** with configurable expiry
- **Password Hashing** with bcrypt
- **Role-based Authorization** (user/admin)
- **CORS Protection** for cross-origin requests
- **Helmet** for security headers
- **Input Validation** with Mongoose schemas
- **Error Handling** with proper HTTP status codes

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment:**
   ```env
   NODE_ENV=production
   JWT_SECRET=very_secure_random_string_here
   MONGODB_URI=your_production_mongodb_uri
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running
   - Check MONGODB_URI in .env file
   - Ensure database name exists

2. **JWT Token Invalid**
   - Check JWT_SECRET is set in .env
   - Verify token format: `Bearer <token>`
   - Check token expiration

3. **CORS Errors**
   - Verify CLIENT_URL in .env matches frontend URL
   - Check if frontend is running on correct port

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:5000 | xargs kill`

### Debug Mode

Set NODE_ENV=development in .env for:
- Detailed error messages
- Request logging
- Stack traces in responses

## Next Steps

1. **Connect to Angular Frontend**
   - Update Angular environment files with API URL
   - Implement HTTP interceptors for JWT tokens
   - Create services for API calls

2. **Add Features**
   - File upload for product images
   - Email notifications
   - Payment gateway integration
   - Inventory management
   - Advanced search and filtering

3. **Optimize**
   - Add Redis for caching
   - Implement rate limiting
   - Add comprehensive logging
   - Performance monitoring

## Support

For issues and questions:
1. Check this setup guide
2. Review API_ENDPOINTS.md for usage examples
3. Check server logs for error details
4. Verify environment configuration
