import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./src/models/Category.js";
import Task from "./src/models/Task.js";

dotenv.config();

const categories = [
  { name: "To Do", color: "#1a73e8" },
  { name: "In Progress", color: "#fb8c00" },
  { name: "Review", color: "#8e24aa" },
  { name: "Done", color: "#43a047" },
];

const getTasks = (ids) => [
  // To Do
  { name: "Set up CI/CD", description: "Configure GitHub Actions for automatic deployment", deadline: new Date("2026-04-10"), status: "pending", category_id: ids[0] },
  { name: "Write README", description: "Project documentation for GitHub repository", deadline: new Date("2026-04-05"), status: "pending", category_id: ids[0] },
  { name: "Add unit tests", description: "Jest tests for backend and frontend", deadline: new Date("2026-04-20"), status: "pending", category_id: ids[0] },

  // In Progress
  { name: "Implement i18n", description: "Add support for Russian and Czech languages", deadline: new Date("2026-04-03"), status: "pending", category_id: ids[1] },
  { name: "Category drag & drop", description: "Column reordering via dnd-kit", deadline: new Date("2026-04-01"), status: "pending", category_id: ids[1] },

  // Review
  { name: "Form validation", description: "express-validator on backend + client-side validation", deadline: new Date("2026-03-30"), status: "pending", category_id: ids[2] },
  { name: "UI components", description: "Button, Input, Textarea, Modal — reusable components", deadline: new Date("2026-03-28"), status: "pending", category_id: ids[2] },

  // Done
  { name: "Set up MongoDB", description: "Connect to MongoDB Atlas", deadline: new Date("2026-03-15"), status: "done", category_id: ids[3] },
  { name: "REST API", description: "CRUD endpoints for Category and Task", deadline: new Date("2026-03-18"), status: "done", category_id: ids[3] },
  { name: "Basic frontend", description: "React + React Router + Axios setup", deadline: new Date("2026-03-20"), status: "done", category_id: ids[3] },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("MongoDB connected");

    await Promise.all([Category.deleteMany(), Task.deleteMany()]);
    console.log("Old data cleared");

    const createdCategories = await Category.insertMany(categories);
    const ids = createdCategories.map((c) => c._id);
    console.log(`Categories created: ${createdCategories.length}`);

    const createdTasks = await Task.insertMany(getTasks(ids));
    console.log(`Tasks created: ${createdTasks.length}`);

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();