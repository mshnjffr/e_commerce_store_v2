import { dbConnection } from '../utils/connection';
import { Category } from '../../src/models/Category';
import { Product } from '../../src/models/Product';
import { User } from '../../src/models/User';
import fs from 'fs/promises';
import path from 'path';

class DatabaseBackup {
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backups');
  }

  async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }
  }

  async backup(): Promise<void> {
    console.log('💾 Starting database backup...\n');

    try {
      await dbConnection.connect();
      await this.ensureBackupDirectory();

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}`);

      // Create timestamped backup directory
      await fs.mkdir(backupPath);

      // Backup collections
      await this.backupCollection('categories', Category, backupPath);
      await this.backupCollection('products', Product, backupPath);
      await this.backupCollection('users', User, backupPath);

      // Create backup metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        collections: ['categories', 'products', 'users'],
        totalRecords: 0
      };

      await fs.writeFile(
        path.join(backupPath, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      console.log(`\n✅ Backup completed successfully!`);
      console.log(`📁 Backup location: ${backupPath}`);

    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    } finally {
      await dbConnection.disconnect();
    }
  }

  private async backupCollection(name: string, model: any, backupPath: string): Promise<void> {
    try {
      console.log(`  📦 Backing up ${name}...`);
      
      const data = await model.find({}).lean();
      const filePath = path.join(backupPath, `${name}.json`);
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      console.log(`    ✓ ${data.length} ${name} records backed up`);
    } catch (error) {
      console.error(`    ❌ Failed to backup ${name}:`, error);
      throw error;
    }
  }

  async restore(backupPath: string): Promise<void> {
    console.log(`🔄 Starting database restore from: ${backupPath}\n`);

    try {
      await dbConnection.connect();

      // Check if backup exists
      try {
        await fs.access(backupPath);
      } catch {
        throw new Error(`Backup directory not found: ${backupPath}`);
      }

      // Read metadata
      const metadataPath = path.join(backupPath, 'metadata.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      console.log(`📊 Backup created: ${metadata.timestamp}`);
      console.log(`📦 Collections: ${metadata.collections.join(', ')}\n`);

      // Confirm restore
      const confirmed = await this.confirmRestore();
      if (!confirmed) {
        console.log('❌ Restore cancelled by user');
        return;
      }

      // Clear existing data
      await this.clearDatabase();

      // Restore collections in order
      const collections = [
        { name: 'categories', model: Category },
        { name: 'products', model: Product },
        { name: 'users', model: User }
      ];

      for (const collection of collections) {
        await this.restoreCollection(collection.name, collection.model, backupPath);
      }

      console.log('\n✅ Database restore completed successfully!');

    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    } finally {
      await dbConnection.disconnect();
    }
  }

  private async restoreCollection(name: string, model: any, backupPath: string): Promise<void> {
    try {
      console.log(`  📦 Restoring ${name}...`);
      
      const filePath = path.join(backupPath, `${name}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);

      if (data.length > 0) {
        await model.insertMany(data);
        console.log(`    ✓ ${data.length} ${name} records restored`);
      } else {
        console.log(`    ⚠️  No ${name} data to restore`);
      }
    } catch (error) {
      console.error(`    ❌ Failed to restore ${name}:`, error);
      throw error;
    }
  }

  private async clearDatabase(): Promise<void> {
    console.log('🗑️  Clearing existing data...');
    
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({})
    ]);

    console.log('✅ Database cleared successfully');
  }

  private async confirmRestore(): Promise<boolean> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('⚠️  This will replace all existing data. Continue? (yes/no): ', resolve);
    });

    rl.close();
    return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
  }

  async listBackups(): Promise<void> {
    try {
      await this.ensureBackupDirectory();
      const backups = await fs.readdir(this.backupDir);
      const backupDirs = [];

      for (const item of backups) {
        const itemPath = path.join(this.backupDir, item);
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory() && item.startsWith('backup-')) {
          const metadataPath = path.join(itemPath, 'metadata.json');
          try {
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(metadataContent);
            backupDirs.push({
              name: item,
              path: itemPath,
              timestamp: metadata.timestamp,
              collections: metadata.collections
            });
          } catch {
            // Skip if metadata is not readable
          }
        }
      }

      if (backupDirs.length === 0) {
        console.log('📂 No backups found');
        return;
      }

      console.log('📂 Available backups:\n');
      backupDirs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .forEach((backup, index) => {
          console.log(`${index + 1}. ${backup.name}`);
          console.log(`   Created: ${new Date(backup.timestamp).toLocaleString()}`);
          console.log(`   Collections: ${backup.collections.join(', ')}`);
          console.log(`   Path: ${backup.path}\n`);
        });

    } catch (error) {
      console.error('❌ Failed to list backups:', error);
    }
  }
}

// CLI interface
if (require.main === module) {
  const backup = new DatabaseBackup();
  const command = process.argv[2];
  const backupPath = process.argv[3];

  switch (command) {
    case 'create':
      backup.backup().catch((error) => {
        console.error('❌ Backup process failed:', error);
        process.exit(1);
      });
      break;

    case 'restore':
      if (!backupPath) {
        console.error('❌ Please provide backup path: npm run db:restore <backup-path>');
        process.exit(1);
      }
      backup.restore(backupPath).catch((error) => {
        console.error('❌ Restore process failed:', error);
        process.exit(1);
      });
      break;

    case 'list':
      backup.listBackups();
      break;

    default:
      console.log('Usage:');
      console.log('  npm run db:backup create     - Create a new backup');
      console.log('  npm run db:backup restore <path> - Restore from backup');
      console.log('  npm run db:backup list       - List available backups');
      break;
  }
}

export default DatabaseBackup;
