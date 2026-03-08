import { Router } from "express";
import { createTask, getTasks, getTaskById, updateTask } from "../controllers/taskController.js";

const router = Router();

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);

export default router;
