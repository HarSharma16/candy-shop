import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    if (!env.MONGO_URI) {
      console.warn("MONGO_URI is not defined. Using default connection string.");
    }
    
    // Configure connection options to prevent timeout issues
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.warn("⚠️  Server will continue running, but database operations will fail.");
    console.warn("📝 To fix this:");
    console.warn("   1. Install MongoDB: https://www.mongodb.com/try/download/community");
    console.warn("   2. Start MongoDB service");
    console.warn("   3. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas");
    // Don't exit - allow server to start even without DB
  }
};

// Helper function to check if MongoDB is connected
export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
