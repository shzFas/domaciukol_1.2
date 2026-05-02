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

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List tasks
 *     description: |
 *       Returns every task in the database (including those in the Archived column).
 *       Pass `?category_id=...` to scope to a single column.
 *       The `category_id` field is **populated** with `{ _id, name, color }` for clients.
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: false
 *         schema: { type: string }
 *         description: Filter tasks by parent category.
 *     responses:
 *       200:
 *         description: Array of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new task
 *     description: |
 *       Creates a card inside a category. Validation rules (`express-validator`):
 *       - `name`: required, string, trimmed.
 *       - `description`: optional string.
 *       - `deadline`: optional ISO-8601 date string.
 *       - `status`: optional, one of `pending` | `done` (default `pending`).
 *       - `category_id`: required, valid MongoDB ObjectId pointing to an existing Category.
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Created. Returns the new task (NOT populated).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post("/", taskValidation, createTask);
router.get("/", getTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by id
 *     description: Returns the task with `category_id` populated.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: The requested task.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a task
 *     description: |
 *       Replaces the editable fields of a task. The same `taskValidation` middleware applies as for POST,
 *       so `name` and `category_id` must always be present.
 *
 *       This endpoint is also how the frontend implements:
 *       - **Move** between columns — change `category_id`.
 *       - **Mark done / pending** — change `status`.
 *       - **Archive / restore** — set `category_id` to the system "Archived" column / a regular column.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Updated task.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Permanently delete a task
 *     description: |
 *       Hard-deletes the task. Note: the frontend's "Delete" action on the board does **not** call this —
 *       it moves the task to the Archived column instead. Permanent deletion happens only from the Archive view.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Task deleted" }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", getTaskById);
router.put("/:id", taskValidation, updateTask);
router.delete("/:id", deleteTask);

export default router;
