# E-Commerce Training Platform

A full-stack e-commerce application built with Angular 18 and Node.js/Express, designed for learning modern web development concepts and practicing with AI coding assistants like Cody.

## 🎯 Project Overview

This is a complete e-commerce platform that demonstrates real-world development patterns and serves as a training ground for developers to practice using AI coding assistants. The application includes all essential e-commerce features: product browsing, shopping cart, user authentication, order management, and admin functionality.

### Key Learning Objectives
- **Frontend Development**: Modern Angular 18 with TypeScript
- **Backend Development**: RESTful API with Node.js and Express
- **Database Integration**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based user authentication
- **State Management**: RxJS observables and Angular services
- **AI-Assisted Development**: Practice using Cody for common coding tasks

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐    ┌─────────────────┐
│   Angular 18    │ ◄─────────────────► │  Node.js/Express│ ◄──┤    MongoDB      │
│   Frontend      │                     │    Backend      │    │    Database     │
│   (Port 4200)   │                     │   (Port 5000)   │    │                 │
└─────────────────┘                     └─────────────────┘    └─────────────────┘
```

### Frontend Architecture (Angular 18)
- **Component-Based**: Modular UI components with clear separation of concerns
- **Service Layer**: Business logic and API communication handled by services
- **Routing**: Client-side routing with guards for protected routes
- **State Management**: Reactive programming with RxJS observables
- **Styling**: Bootstrap 5 for responsive design

### Backend Architecture (Node.js/Express)
- **RESTful API**: Standard HTTP methods and status codes
- **MVC Pattern**: Controllers handle routes, models define data structure
- **Middleware**: Authentication, CORS, error handling, and logging
- **Database Integration**: MongoDB with Mongoose ODM (all database logic is in backend)

## 🛠️ Technology Stack

### Frontend
- **Angular 18**: Latest version with standalone components
- **TypeScript**: Type-safe JavaScript development
- **Bootstrap 5**: Responsive CSS framework
- **RxJS**: Reactive programming for async operations
- **Angular Router**: Client-side navigation

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Backend also uses TypeScript for consistency
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: Object modeling for MongoDB
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing for security

### Development Tools
- **Angular CLI**: Project scaffolding and build tools
- **Nodemon**: Auto-restart during development
- **ts-node**: TypeScript execution for Node.js
- **CORS**: Cross-origin resource sharing

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have these installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd angular

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Database Setup
```bash
# Option A: Local MongoDB (if installed)
mongod

# Option B: Update backend/.env with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
```

### 3. Environment Configuration
Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 4. Start the Application
```bash
# Terminal 1: Start backend (from backend directory)
cd backend
npm run dev

# Terminal 2: Start frontend (from frontend directory)
cd frontend
ng serve

# Access the application
Frontend: http://localhost:4200
Backend API: http://localhost:5000/api/v1
```

### 5. Seed Sample Data
```bash
# From backend directory
cd backend
npm run db:seed
```

## 📁 Project Structure

```
angular/
├── README.md                    # This file
├── frontend/                    # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── cart/            # Shopping cart functionality
│   │   │   ├── checkout/        # Checkout process
│   │   │   ├── exercises/       # Cody AI training exercises
│   │   │   ├── guards/          # Route protection
│   │   │   ├── header/          # Navigation component
│   │   │   ├── home/            # Homepage
│   │   │   ├── interceptors/    # HTTP interceptors
│   │   │   ├── models/          # TypeScript interfaces
│   │   │   ├── orders/          # Order management
│   │   │   ├── pages/           # Product and category pages
│   │   │   ├── services/        # Business logic services
│   │   │   ├── shared/          # Reusable components
│   │   │   └── user-profile/    # User account management
│   │   ├── assets/              # Images and static files
│   │   └── styles/              # Global CSS
│   ├── package.json
│   └── angular.json
└── backend/                     # Node.js/Express API + Database
    ├── src/
    │   ├── controllers/         # Request handlers
    │   ├── middleware/          # Express middleware
    │   ├── models/              # MongoDB schemas (Mongoose)
    │   ├── routes/              # API route definitions
    │   └── utils/               # Helper functions
    ├── database/
    │   └── data/                # Seed data files for MongoDB
    ├── package.json
    └── .env.example             # Database connection config
```

## 🎯 Key Features

### User Features
- **🏠 Product Browsing**: View products by category with filtering and search
- **🛒 Shopping Cart**: Add/remove items, update quantities, persist cart state
- **👤 User Authentication**: Register, login, logout with secure JWT tokens
- **📋 Order Management**: Place orders, view order history and status
- **💳 Simple Checkout**: Streamlined order placement process
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

### Admin Features (Role-based)
- **📊 Product Management**: Create, edit, delete products and categories
- **📦 Order Management**: View and update order statuses
- **👥 User Management**: View user accounts and order history

### Developer Features
- **🤖 AI Exercise Platform**: Practice using Cody for common development tasks
- **🔍 Code Understanding**: Learn how different parts of the application work
- **🛠️ Development Tools**: Hot reload, TypeScript support, debugging setup

## 🔌 API Documentation

### Authentication Endpoints
```
POST   /api/v1/auth/register     # Create new user account
POST   /api/v1/auth/login        # User login
POST   /api/v1/auth/logout       # User logout
GET    /api/v1/auth/me           # Get current user info
```

### Product Endpoints
```
GET    /api/v1/products          # Get all products
GET    /api/v1/products/:id      # Get single product
POST   /api/v1/products          # Create product (admin)
PUT    /api/v1/products/:id      # Update product (admin)
DELETE /api/v1/products/:id      # Delete product (admin)
```

### Category Endpoints
```
GET    /api/v1/categories        # Get all categories
GET    /api/v1/categories/:id    # Get single category
POST   /api/v1/categories        # Create category (admin)
```

### Cart Endpoints
```
GET    /api/v1/cart              # Get user's cart
POST   /api/v1/cart              # Add item to cart
PUT    /api/v1/cart/:itemId      # Update cart item
DELETE /api/v1/cart/:itemId      # Remove cart item
DELETE /api/v1/cart              # Clear entire cart
```

### Order Endpoints
```
GET    /api/v1/orders            # Get user's orders
GET    /api/v1/orders/:id        # Get single order
POST   /api/v1/orders            # Create new order
PUT    /api/v1/orders/:id        # Update order status (admin)
```

## 🔧 Common Development Tasks

### Adding a New Feature
1. **Frontend**: Create components using Angular CLI
   ```bash
   ng generate component feature-name
   ng generate service feature-name
   ```

2. **Backend**: Add routes, controllers, and models
   ```bash
   # Create new files in appropriate directories
   touch src/routes/featureRoutes.ts
   touch src/controllers/FeatureController.ts
   touch src/models/Feature.ts
   ```

### Database Operations
```bash
# All database commands run from backend directory
cd backend

# Reset database with fresh data
npm run db:reset

# Seed only sample data
npm run db:seed

# Quick reset (preserves users)
npm run db:reset:quick
```

### Running Tests
```bash
# Frontend tests
cd frontend
ng test

# Backend tests (if configured)
cd backend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
ng build --configuration production

# Backend (TypeScript compilation)
cd backend
npm run build
```

## 🎓 Learning Path for Junior Developers

### Beginner Level
1. **Understand the Project Structure**: Explore folders and file organization
2. **Study the Models**: Look at TypeScript interfaces and database schemas
3. **Trace Data Flow**: Follow how data moves from database → API → frontend
4. **Practice with Cody**: Use the exercises page to practice AI-assisted coding

### Intermediate Level
1. **Add New Features**: Implement wishlist or product reviews
2. **Customize Styling**: Modify the Bootstrap theme
3. **API Integration**: Add new endpoints and connect to frontend
4. **State Management**: Understand RxJS observables and Angular services

### Advanced Level
1. **Performance Optimization**: Implement lazy loading and caching
2. **Security Enhancements**: Add input validation and security headers
3. **Testing**: Write unit and integration tests
4. **Deployment**: Deploy to cloud platforms (Vercel, Heroku, etc.)

## 🎯 Cody AI Training Exercises

This codebase includes a dedicated exercises section (`/exercises`) designed to help developers practice using AI coding assistants. The exercises cover:

1. **Code Understanding**: Ask Cody to explain complex code patterns
2. **Code Generation**: Generate new components, services, and features
3. **Debugging**: Use Cody to identify and fix bugs
4. **Refactoring**: Improve code quality and organization
5. **Test Generation**: Create unit and integration tests

### How to Use the Exercises
1. Navigate to `http://localhost:4200/exercises`
2. Choose an exercise category
3. Follow the instructions to practice with Cody
4. Check off completed exercises to track progress

## 🐛 Troubleshooting

### Common Issues

**Frontend won't start**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Backend connection errors**
- Check if MongoDB is running
- Verify `.env` file configuration
- Ensure correct MongoDB connection string

**CORS errors**
- Backend CORS is configured for `http://localhost:4200`
- If using different ports, update `backend/src/middleware/corsConfig.ts`

**Build errors**
```bash
# Clear Angular cache
ng cache clean

# Clear TypeScript cache
rm -rf dist/ .angular/
```

### Getting Help
1. Check the console for error messages
2. Review the API responses in browser dev tools
3. Use the exercises section to practice debugging with Cody
4. Refer to Angular and Express.js documentation

## 📚 Additional Resources

### Documentation
- [Angular Documentation](https://angular.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Bootstrap Components](https://getbootstrap.com/docs/5.3/components/)

### Learning Resources
- [Angular Tutorial](https://angular.dev/tutorials)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
