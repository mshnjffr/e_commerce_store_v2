import { dbConnection } from '../utils/connection';
import { Category } from '../../src/models/Category';
import { Product } from '../../src/models/Product';
import { User } from '../../src/models/User';
import categoriesData from '../data/categories.json';
import productsData from '../data/products.json';
import usersData from '../data/users.json';
import readline from 'readline';

interface CategoryMap {
  [key: string]: string;
}

class DatabaseSeeder {
  private categoryMap: CategoryMap = {};

  async confirmClearData(): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('⚠️  This will delete all existing data. Are you sure? (yes/no): ', resolve);
    });

    rl.close();
    return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
  }

  async clearDatabase(): Promise<void> {
    console.log('🗑️  Clearing existing data...');
    
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({})
    ]);

    console.log('✅ Database cleared successfully');
  }

  async seedCategories(): Promise<void> {
    console.log('📁 Seeding categories...');

    // First pass: Create all categories without parent references
    const createdCategories = [];
    for (const categoryData of categoriesData) {
      const category = new Category({
        name: categoryData.name,
        description: categoryData.description,
        image: categoryData.image,
        isActive: categoryData.isActive
      });

      const savedCategory = await category.save();
      createdCategories.push(savedCategory);
      this.categoryMap[categoryData.name] = savedCategory._id.toString();
      
      console.log(`  ✓ Created category: ${categoryData.name}`);
    }

    // Second pass: Update parent category references
    for (let i = 0; i < categoriesData.length; i++) {
      const categoryData = categoriesData[i];
      if (categoryData.parentCategory) {
        const parentId = this.categoryMap[categoryData.parentCategory];
        if (parentId) {
          await Category.findByIdAndUpdate(createdCategories[i]._id, {
            parentCategory: parentId
          });
          console.log(`  ✓ Updated parent for: ${categoryData.name} -> ${categoryData.parentCategory}`);
        }
      }
    }

    console.log(`✅ Created ${createdCategories.length} categories`);
  }

  async seedProducts(): Promise<void> {
    console.log('📦 Seeding products...');

    const products = [];
    for (const productData of productsData) {
      const categoryId = this.categoryMap[productData.category];
      if (!categoryId) {
        console.warn(`⚠️  Category not found for product: ${productData.name}`);
        continue;
      }

      // Generate some sample ratings
      const ratings = this.generateSampleRatings();

      const product = new Product({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        categoryId: categoryId,
        images: productData.images,
        stock: productData.stock,
        sku: productData.sku,
        isActive: productData.isActive,
        ratings: ratings
      });

      const savedProduct = await product.save();
      products.push(savedProduct);
      
      console.log(`  ✓ Created product: ${productData.name} (${productData.sku})`);
    }

    console.log(`✅ Created ${products.length} products`);
  }

  async seedUsers(): Promise<void> {
    console.log('👤 Seeding users...');

    const users = [];
    for (const userData of usersData) {
      const user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password, // Will be hashed by the pre-save middleware
        phone: userData.phone,
        address: userData.address,
        role: userData.role,
        isActive: userData.isActive
      });

      const savedUser = await user.save();
      users.push(savedUser);
      
      console.log(`  ✓ Created ${userData.role}: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    console.log(`✅ Created ${users.length} users`);
  }

  private generateSampleRatings(): any[] {
    const numRatings = Math.floor(Math.random() * 20) + 5; // 5-25 ratings
    const ratings = [];

    for (let i = 0; i < numRatings; i++) {
      // Bias towards higher ratings (4-5 stars more common)
      const rating = Math.random() < 0.7 ? 
        Math.floor(Math.random() * 2) + 4 : // 4-5 stars (70% chance)
        Math.floor(Math.random() * 3) + 2;  // 2-4 stars (30% chance)

      const comments = [
        'Great product, highly recommend!',
        'Good value for money.',
        'Fast shipping, excellent quality.',
        'Exactly as described.',
        'Very satisfied with this purchase.',
        'Could be better, but decent overall.',
        'Amazing quality, exceeded expectations!',
        'Perfect for what I needed.',
        'Good product, will buy again.',
        ''
      ];

      ratings.push({
        // We'll use a dummy ObjectId since we don't have real users yet
        userId: '507f1f77bcf86cd799439011',
        rating: rating,
        comment: Math.random() < 0.7 ? comments[Math.floor(Math.random() * comments.length)] : ''
      });
    }

    return ratings;
  }

  async run(): Promise<void> {
    try {
      console.log('🚀 Starting database seeding process...\n');

      // Connect to database
      await dbConnection.connect();

      // Confirm data clearing
      const confirmed = await this.confirmClearData();
      if (!confirmed) {
        console.log('❌ Seeding cancelled by user');
        await dbConnection.disconnect();
        return;
      }

      // Clear existing data
      await this.clearDatabase();

      // Seed data in order (categories first, then products that reference them)
      await this.seedCategories();
      await this.seedProducts();
      await this.seedUsers();

      console.log('\n🎉 Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   Categories: ${categoriesData.length}`);
      console.log(`   Products: ${productsData.length}`);
      console.log(`   Users: ${usersData.length}`);
      console.log('\n📝 Admin User Credentials:');
      console.log('   Email: admin@ecommerce.com');
      console.log('   Password: Admin123!');

    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      await dbConnection.disconnect();
    }
  }
}

// Run seeder if called directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run().catch((error) => {
    console.error('❌ Seeding process failed:', error);
    process.exit(1);
  });
}

export default DatabaseSeeder;
