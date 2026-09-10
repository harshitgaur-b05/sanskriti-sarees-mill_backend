import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    
    await mongoose.connect(url);
    console.log("MongoDB connected via Mongoose");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
