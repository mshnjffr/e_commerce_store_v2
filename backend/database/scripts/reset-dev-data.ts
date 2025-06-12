import DatabaseSeeder from './seed';

class DevDataReset {
  async resetDevelopmentData(): Promise<void> {
    console.log('🔄 Resetting development data...\n');
    
    // Check if we're in development environment
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv === 'production') {
      console.error('❌ Cannot reset data in production environment!');
      console.error('   Set NODE_ENV to "development" or "test" to proceed.');
      process.exit(1);
    }

    console.log(`🌍 Environment: ${nodeEnv}`);
    console.log('   This will reset all data to the default development dataset.\n');

    try {
      const seeder = new DatabaseSeeder();
      await seeder.run();
      
      console.log('\n🎉 Development data reset completed!');
      console.log('\n🚀 You can now start developing with fresh sample data.');
      
    } catch (error) {
      console.error('❌ Development data reset failed:', error);
      process.exit(1);
    }
  }

  async quickReset(): Promise<void> {
    console.log('⚡ Quick development data reset (no confirmation)...\n');
    
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv === 'production') {
      console.error('❌ Cannot reset data in production environment!');
      process.exit(1);
    }

    // Override the confirmation method to skip user input
    const originalMethod = DatabaseSeeder.prototype['confirmClearData'];
    DatabaseSeeder.prototype['confirmClearData'] = async () => true;

    try {
      const seeder = new DatabaseSeeder();
      await seeder.run();
      
      console.log('\n⚡ Quick reset completed!');
      
    } catch (error) {
      console.error('❌ Quick reset failed:', error);
      process.exit(1);
    } finally {
      // Restore original method
      DatabaseSeeder.prototype['confirmClearData'] = originalMethod;
    }
  }
}

// CLI interface
if (require.main === module) {
  const devReset = new DevDataReset();
  const command = process.argv[2];

  switch (command) {
    case 'quick':
      devReset.quickReset();
      break;
    default:
      devReset.resetDevelopmentData();
      break;
  }
}

export default DevDataReset;
