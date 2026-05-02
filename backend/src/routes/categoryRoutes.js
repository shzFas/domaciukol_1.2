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

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories
 *     description: Returns every column on the board, including the system-reserved columns (Done, Archived).
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Array of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new category
 *     description: |
 *       Creates a new column. Validation rules:
 *       - `name` is required and must be a non-empty string.
 *       - `name` must be unique (case-insensitive).
 *       - `name` cannot equal a reserved system name (`Done`, `Archived`).
 *       - `color` (optional) must be a valid hex color (`#RGB` or `#RRGGBB`).
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Created. Returns the new category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post("/", categoryValidation, createCategory);
router.get("/", getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get a single category by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId
 *     responses:
 *       200:
 *         description: The requested category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a category
 *     description: |
 *       Updates the column's name and/or color. Same validation as POST. Additionally:
 *       - You **cannot** rename a reserved column (Done / Archived) — `409 categoryReservedReadOnly`.
 *       - You **cannot** rename another column to a reserved name — `409 categoryNameReserved`.
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Updated category.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *   delete:
 *     summary: Delete a category
 *     description: |
 *       Deletes the category and **cascades to all tasks** in it (they are removed permanently).
 *       Reserved columns (Done, Archived) cannot be deleted — `409 categoryReservedReadOnly`.
 *     tags: [Categories]
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
 *                 message: { type: string, example: "Category deleted" }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", getCategoryById);
router.put("/:id", categoryValidation, updateCategory);
router.delete("/:id", deleteCategory);

export default router;
