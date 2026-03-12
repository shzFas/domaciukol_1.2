import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { taskValidation } from "../validation/taskValidation.js";

const router = Router();

router.post("/", taskValidation, createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", taskValidation, updateTask);
router.delete("/:id", deleteTask);

export default router;
