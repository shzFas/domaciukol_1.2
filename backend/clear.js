import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./src/models/Category.js";
import Task from "./src/models/Task.js";

dotenv.config();

const clear = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("MongoDB connected");

    const [categories, tasks] = await Promise.all([
      Category.deleteMany(),
      Task.deleteMany(),
    ]);

    console.log(`Deleted categories: ${categories.deletedCount}`);
    console.log(`Deleted tasks: ${tasks.deletedCount}`);
    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Clear error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

clear();