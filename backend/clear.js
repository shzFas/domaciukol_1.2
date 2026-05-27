import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./src/models/Category.js";
import Task from "./src/models/Task.js";

dotenv.config();

const RESERVED_NAMES = ["done", "archived"];

const clear = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("MongoDB connected");

    // Find system categories to keep
    const systemCategories = await Category.find({
      name: { $regex: `^(${RESERVED_NAMES.join("|")})$`, $options: "i" },
    });
    const systemIds = systemCategories.map((c) => c._id);

    // Delete only non-reserved categories
    const categories = await Category.deleteMany({
      _id: { $nin: systemIds },
    });

    // Delete tasks that don't belong to system categories
    const tasks = await Task.deleteMany({
      category_id: { $nin: systemIds },
    });

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