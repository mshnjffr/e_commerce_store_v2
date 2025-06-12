# E-commerce Database Setup

This directory contains all the database setup, seeding, and utility scripts for the e-commerce application.

## Directory Structure

```
database/
├── data/           # Sample data files
│   ├── categories.json
│   ├── products.json
│   └── users.json
├── scripts/        # Database scripts
│   ├── seed.ts
│   ├── test-connection.ts
│   ├── backup.ts
│   └── reset-dev-data.ts
├── utils/          # Database utilities
│   └── connection.ts
├── backups/        # Auto-generated backup directory
└── README.md
```

## Quick Start

### 1. Test Database Connection
```bash
npm run db:test
```

### 2. Seed Database with Sample Data
```bash
npm run db:seed
```

### 3. Reset Development Data (Quick)
```bash
npm run db:reset:quick
```

## Available Scripts

### Database Connection
- `npm run db:test` - Test MongoDB connection

### Database Seeding
- `npm run db:seed` - Seed database with sample data (with confirmation)
- `npm run db:reset` - Reset development data (with confirmation)
- `npm run db:reset:quick` - Quick reset without confirmation (dev/test only)

### Database Backup & Restore
- `npm run db:backup create` - Create a new backup
- `npm run db:backup list` - List all available backups
- `npm run db:backup restore <backup-path>` - Restore from a specific backup

## Sample Data Overview

### Categories (20 total)
- **Electronics** (5 subcategories)
  - Laptops & Computers
  - Mobile Phones
  - Audio & Headphones
  - Cameras & Photography
- **Books** (3 subcategories)
  - Fiction
  - Non-Fiction
  - Science & Technology
- **Clothing & Fashion** (3 subcategories)
  - Men's Clothing
  - Women's Clothing
  - Shoes & Footwear
- **Home & Garden** (3 subcategories)
  - Furniture
  - Kitchen & Dining
  - Garden & Outdoor
- **Sports & Outdoors** (2 subcategories)
  - Fitness Equipment
  - Outdoor Recreation

### Products (25 total)
- **Electronics**: MacBook Pro, Dell XPS, iPhone 15 Pro, Samsung Galaxy S24, Sony Headphones, etc.
- **Books**: Popular fiction, non-fiction, and technical books
- **Clothing**: Levi's jeans, Nike shoes, Zara blazer, Adidas sneakers
- **Home**: IKEA furniture, Instant Pot, Weber grill, Herman Miller chair
- **Sports**: Peloton bike, REI tent, Hydro Flask

### Users (10 total)
- 1 Admin user: `admin@ecommerce.com` / `Admin123!`
- 9 Regular users with realistic profiles and addresses

### Product Features
- Realistic pricing ($16.99 - $2,499.99)
- High-quality placeholder images from Unsplash
- Proper stock quantities (8-203 items)
- Sample ratings and reviews (5-25 per product)
- Proper category relationships
- Unique SKUs for inventory management

## Environment Setup

Make sure your `.env` file contains:

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
BCRYPT_ROUNDS=12
NODE_ENV=development
```

For production environments, use a proper MongoDB connection string with authentication.

## Database Schema

### Categories
- Hierarchical structure with parent-child relationships
- Support for unlimited nesting levels
- Active/inactive status for easy management

### Products
- Full product information with pricing and inventory
- Multiple images support
- Category relationships (both name and ObjectId)
- Built-in rating system with automatic average calculation
- Stock management with non-negative constraints

### Users
- Secure password hashing with bcrypt
- Role-based access (user/admin)
- Address information for shipping
- Email uniqueness and validation

## Development Workflow

### Initial Setup
1. Start MongoDB service
2. Run `npm run db:test` to verify connection
3. Run `npm run db:seed` to populate with sample data

### During Development
- Use `npm run db:reset:quick` to quickly reset data
- Use `npm run db:backup create` before major changes
- Use regular `npm run db:reset` for confirmed resets

### Production Deployment
- Never use reset scripts in production
- Always backup before updates: `npm run db:backup create`
- Use restore only for disaster recovery

## Backup System

### Automatic Backups
- Timestamped backup directories
- JSON export of all collections
- Metadata tracking
- Full restoration capability

### Backup Location
- Local: `backend/database/backups/`
- Format: `backup-YYYY-MM-DDTHH-MM-SS/`

### Restoration Process
1. List available backups: `npm run db:backup list`
2. Choose backup to restore
3. Run: `npm run db:backup restore <backup-path>`

## Security Considerations

### Password Security
- All user passwords are hashed with bcrypt
- Configurable salt rounds via environment variable
- Passwords excluded from JSON responses

### Admin Access
- Default admin credentials provided for development
- Change admin password in production
- Role-based access control implemented

### Environment Safety
- Production environment checks prevent accidental data loss
- Development-only quick reset functionality
- Confirmation prompts for destructive operations

## Troubleshooting

### Connection Issues
1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check `MONGODB_URI` in `.env`
3. Ensure network connectivity
4. Run `npm run db:test` for detailed diagnostics

### Seeding Issues
1. Clear database manually if needed
2. Check for unique constraint violations
3. Verify category relationships
4. Ensure sufficient disk space

### Performance Considerations
- Database indexes are properly configured
- Connection pooling handled by Mongoose
- Efficient queries with proper field selection
- Avoid N+1 query problems with population

## Data Validation

All models include comprehensive validation:
- Required field validation
- Data type constraints
- String length limits
- Numeric range validation
- Email format validation
- Unique constraints where appropriate

## Contributing

When adding new sample data:
1. Update the appropriate JSON file in `data/`
2. Ensure data follows existing patterns
3. Update this README if adding new categories
4. Test seeding process thoroughly
5. Consider adding relevant indexes
