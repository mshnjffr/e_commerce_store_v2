import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
      
      await mongoose.connect(mongoUri);
      
      this.isConnected = true;
      console.log('✅ Connected to MongoDB successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📡 MongoDB disconnected');
        this.isConnected = false;
      });

      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📡 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      const result = await mongoose.connection.db.admin().ping();
      console.log('🏓 MongoDB ping successful:', result);
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection test failed:', error);
      return false;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnectionInfo(): {
    status: string;
    host: string | undefined;
    port: string | undefined;
    database: string | undefined;
  } {
    const connection = mongoose.connection;
    return {
      status: this.getConnectionStatusString(),
      host: connection.host,
      port: connection.port?.toString(),
      database: connection.name
    };
  }

  private getConnectionStatusString(): string {
    switch (mongoose.connection.readyState) {
      case 0: return 'disconnected';
      case 1: return 'connected';
      case 2: return 'connecting';
      case 3: return 'disconnecting';
      default: return 'unknown';
    }
  }
}

export const dbConnection = DatabaseConnection.getInstance();
