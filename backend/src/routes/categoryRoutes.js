import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { categoryValidation } from "../validation/categoryValidation.js";

const router = Router();

router.post("/", categoryValidation, createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", categoryValidation, updateCategory);
router.delete("/:id", deleteCategory);

export default router;
