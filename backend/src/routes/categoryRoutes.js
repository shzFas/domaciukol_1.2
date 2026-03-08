import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById
} from "../controllers/categoryController.js";

const router = Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);

export default router;