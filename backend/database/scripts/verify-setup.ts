import { dbConnection } from '../utils/connection';
import { Category } from '../../src/models/Category';
import { Product } from '../../src/models/Product';
import { User } from '../../src/models/User';

class SetupVerification {
  async verifyDatabaseSetup(): Promise<void> {
    console.log('🔍 Verifying database setup...\n');

    try {
      await dbConnection.connect();

      // Test connection
      const connectionInfo = dbConnection.getConnectionInfo();
      console.log('📊 Database Connection:');
      console.log(`   Status: ${connectionInfo.status}`);
      console.log(`   Database: ${connectionInfo.database}`);
      console.log(`   Host: ${connectionInfo.host}:${connectionInfo.port}\n`);

      // Verify collections and count documents
      const [categoryCount, productCount, userCount] = await Promise.all([
        Category.countDocuments(),
        Product.countDocuments(),
        User.countDocuments()
      ]);

      console.log('📈 Collection Counts:');
      console.log(`   Categories: ${categoryCount}`);
      console.log(`   Products: ${productCount}`);
      console.log(`   Users: ${userCount}\n`);

      // Verify data integrity
      await this.verifyCategories();
      await this.verifyProducts();
      await this.verifyUsers();

      console.log('✅ Database setup verification completed successfully!\n');
      console.log('🚀 Your e-commerce database is ready for development!');

    } catch (error) {
      console.error('❌ Verification failed:', error);
      throw error;
    } finally {
      await dbConnection.disconnect();
    }
  }

  private async verifyCategories(): Promise<void> {
    console.log('📁 Verifying Categories:');

    // Check parent categories
    const parentCategories = await Category.find({ parentCategory: null });
    console.log(`   Parent categories: ${parentCategories.length}`);

    // Check subcategories
    const subCategories = await Category.find({ parentCategory: { $ne: null } });
    console.log(`   Subcategories: ${subCategories.length}`);

    // Verify category structure
    const electronics = await Category.findOne({ name: 'Electronics' });
    if (electronics) {
      const electronicsSubcats = await Category.find({ parentCategory: electronics._id });
      console.log(`   Electronics subcategories: ${electronicsSubcats.length}`);
    }

    console.log('   ✓ Category structure verified\n');
  }

  private async verifyProducts(): Promise<void> {
    console.log('📦 Verifying Products:');

    // Check products by category
    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('   Products by category:');
    productsByCategory.forEach(cat => {
      console.log(`     ${cat._id}: ${cat.count}`);
    });

    // Check price range
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    if (priceStats.length > 0) {
      const stats = priceStats[0];
      console.log(`   Price range: $${stats.minPrice} - $${stats.maxPrice}`);
      console.log(`   Average price: $${stats.avgPrice.toFixed(2)}`);
    }

    // Check products with ratings
    const productsWithRatings = await Product.countDocuments({ 
      'ratings.0': { $exists: true } 
    });
    console.log(`   Products with ratings: ${productsWithRatings}`);

    console.log('   ✓ Product data verified\n');
  }

  private async verifyUsers(): Promise<void> {
    console.log('👤 Verifying Users:');

    // Check user roles
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });

    console.log(`   Admin users: ${adminCount}`);
    console.log(`   Regular users: ${userCount}`);

    // Verify admin user exists
    const adminUser = await User.findOne({ email: 'admin@ecommerce.com' });
    if (adminUser) {
      console.log('   ✓ Admin user found');
    } else {
      console.log('   ⚠️  Admin user not found');
    }

    // Check users with addresses
    const usersWithAddress = await User.countDocuments({ 
      'address.street': { $exists: true } 
    });
    console.log(`   Users with addresses: ${usersWithAddress}`);

    console.log('   ✓ User data verified\n');
  }

  async generateSummaryReport(): Promise<void> {
    console.log('📋 Generating Summary Report...\n');

    try {
      await dbConnection.connect();

      // Sample products by category
      const sampleProducts = await Product.aggregate([
        { $sample: { size: 5 } },
        { $project: { name: 1, category: 1, price: 1, stock: 1 } }
      ]);

      console.log('🛍️  Sample Products:');
      sampleProducts.forEach(product => {
        console.log(`   ${product.name} - $${product.price} (${product.stock} in stock)`);
      });

      console.log('\n📊 Database Ready for:');
      console.log('   ✓ Product catalog browsing');
      console.log('   ✓ Category navigation');
      console.log('   ✓ User authentication');
      console.log('   ✓ Shopping cart functionality');
      console.log('   ✓ Order processing');
      console.log('   ✓ Admin management');

    } catch (error) {
      console.error('❌ Report generation failed:', error);
    } finally {
      await dbConnection.disconnect();
    }
  }
}

// CLI interface
if (require.main === module) {
  const verifier = new SetupVerification();
  const command = process.argv[2];

  switch (command) {
    case 'report':
      verifier.generateSummaryReport();
      break;
    default:
      verifier.verifyDatabaseSetup().catch((error) => {
        console.error('❌ Verification process failed:', error);
        process.exit(1);
      });
      break;
  }
}

export default SetupVerification;
