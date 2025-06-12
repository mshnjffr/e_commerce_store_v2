# Database Setup Instructions

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites
- MongoDB installed and running locally
- Node.js and npm installed
- Backend dependencies installed (`npm install`)

### 2. Configure Environment
Copy `.env.example` to `.env` (if not already done):
```bash
cp .env.example .env
```

The default configuration uses:
- Database: `mongodb://localhost:27017/ecommerce`
- Default port: `5000`

### 3. Test Database Connection
```bash
npm run db:test
```
✅ You should see: "Database connection test passed!"

### 4. Seed Database with Sample Data
```bash
npm run db:seed
```
- This will prompt for confirmation before clearing existing data
- Seeds 20 categories, 25 products, and 10 users
- Takes about 30 seconds to complete

## 🎉 You're Ready!

### Admin Login Credentials
```
Email: admin@ecommerce.com
Password: Admin123!
```

### Test User Credentials
```
Email: john.doe@email.com
Password: User123!
```

## 📊 What Was Created

### Categories (20 total)
```
Electronics/
├── Laptops & Computers
├── Mobile Phones
├── Audio & Headphones
└── Cameras & Photography

Books/
├── Fiction
├── Non-Fiction
└── Science & Technology

Clothing & Fashion/
├── Men's Clothing
├── Women's Clothing
└── Shoes & Footwear

Home & Garden/
├── Furniture
├── Kitchen & Dining
└── Garden & Outdoor

Sports & Outdoors/
├── Fitness Equipment
└── Outdoor Recreation
```

### Sample Products (25 total)
- **High-end Electronics**: MacBook Pro M3 ($2,499), iPhone 15 Pro Max ($1,199)
- **Popular Books**: "Atomic Habits" ($18.99), "Clean Code" ($42.99)
- **Fashion Items**: Levi's 501 Jeans ($89.99), Nike Air Force 1 ($110)
- **Home Items**: Herman Miller Aeron Chair ($1,395), Instant Pot ($99.99)
- **Sports Gear**: Peloton Bike+ ($2,495), REI Tent ($399.99)

### Sample Users (10 total)
- 1 Admin user with full permissions
- 9 Regular users with realistic profiles and addresses across different US states

## 🛠️ Useful Commands

### Daily Development
```bash
# Quick reset (no confirmation) - Use this most often
npm run db:reset:quick

# Test connection
npm run db:test

# Full reset with confirmation
npm run db:reset
```

### Backup & Restore
```bash
# Create backup
npm run db:backup create

# List backups
npm run db:backup list

# Restore from backup
npm run db:backup restore <path>
```

## 🔧 Troubleshooting

### "Connection failed" Error
1. **Start MongoDB**: 
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

2. **Check if MongoDB is running**:
   ```bash
   # Test with mongo shell
   mongosh
   # or older versions
   mongo
   ```

3. **Verify connection string**: Check `MONGODB_URI` in `.env`

### "Permission denied" Error
- Make sure MongoDB has proper file permissions
- Run with proper user permissions

### "Port already in use" Error
- Change `PORT` in `.env` file
- Or kill the process using the port

## 🚨 Important Notes

### Development vs Production
- These scripts are safe for development environments
- **NEVER** run `db:reset` commands in production
- Always backup production data before changes

### Data Persistence
- Sample data includes realistic ratings and reviews
- Product images use high-quality Unsplash placeholder URLs
- All relationships between models are properly established

### Security
- All passwords are properly hashed with bcrypt
- Admin credentials should be changed in production
- User passwords follow secure patterns (User123!)

## 🔍 Verifying Your Setup

After seeding, you can verify the data was created correctly:

### Using MongoDB Shell
```bash
mongosh
use ecommerce

# Check categories
db.categories.countDocuments()  // Should return 20

# Check products
db.products.countDocuments()    // Should return 25

# Check users
db.users.countDocuments()       // Should return 10

# View sample product
db.products.findOne({name: "MacBook Pro 16-inch M3"})
```

### Using the API (once server is running)
```bash
# Test API endpoints
curl http://localhost:5000/api/categories
curl http://localhost:5000/api/products
curl "http://localhost:5000/api/products?category=Electronics"
```

## 🎯 Next Steps

1. **Start the development server**: `npm run dev`
2. **Test API endpoints** with your frontend or Postman
3. **Customize sample data** by editing files in `database/data/`
4. **Add more products** or categories as needed
5. **Set up your frontend** to consume the API

## 📚 Additional Resources

- **Database Schema**: See `/src/models/` for complete model definitions
- **API Documentation**: Check `API_ENDPOINTS.md` in the backend root
- **Full Database README**: `/database/README.md` for advanced usage

---

🎉 **Congratulations!** Your e-commerce database is now set up with realistic sample data and ready for development!
