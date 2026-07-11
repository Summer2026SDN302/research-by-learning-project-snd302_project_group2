import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Missing MONGODB_URI in environment variables");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");
    console.log("Mongo connected host:", mongoose.connection.host);
    console.log("Mongo connected db:", mongoose.connection.name);
    console.log("Mongo connection readyState:", mongoose.connection.readyState);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
