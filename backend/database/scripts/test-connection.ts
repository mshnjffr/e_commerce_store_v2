import { dbConnection } from '../utils/connection';

async function testDatabaseConnection(): Promise<void> {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test connection
    const isConnected = await dbConnection.testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection test passed!');
      
      // Display connection info
      const info = dbConnection.getConnectionInfo();
      console.log('\n📊 Connection Details:');
      console.log(`   Status: ${info.status}`);
      console.log(`   Host: ${info.host || 'localhost'}`);
      console.log(`   Port: ${info.port || '27017'}`);
      console.log(`   Database: ${info.database || 'ecommerce'}`);
      
    } else {
      console.log('❌ Database connection test failed!');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Make sure MongoDB is running');
      console.log('   2. Check your MONGODB_URI in .env file');
      console.log('   3. Verify network connectivity');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Connection test error:', error);
    process.exit(1);
  } finally {
    await dbConnection.disconnect();
  }
}

// Run test if called directly
if (require.main === module) {
  testDatabaseConnection();
}

export default testDatabaseConnection;
