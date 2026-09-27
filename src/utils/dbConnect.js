import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export const dbConnect = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};
