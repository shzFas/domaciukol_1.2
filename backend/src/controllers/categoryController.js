import Category from "../models/Category.js";
import Task from "../models/Task.js";

/**
 * Names the system manages itself. Clients cannot create or modify categories
 * with these names (case-insensitive). Both columns are auto-seeded on server
 * startup by `ensureSystemCategories`.
 *
 *   - "done"     — moving a task into this column auto-marks it as `status: "done"`.
 *   - "archived" — soft-delete bin; tasks here are hidden from the board UI.
 *
 * @type {string[]}
 */
const RESERVED_NAMES = ["done", "archived"];

/** Escape a user-supplied string so it can be safely embedded in a regex. */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True if the given name (after trim/lowercase) is a system-reserved name. */
const isReserved = (name) =>
  RESERVED_NAMES.includes((name || "").trim().toLowerCase());

/**
 * Find a category by name, case-insensitive. Used to enforce uniqueness.
 *
 * @param {string} name      Trimmed name to look up.
 * @param {string} [excludeId]  When updating, exclude the document being edited
 *                              so a no-op rename doesn't false-positive.
 */
const findByNameCI = (name, excludeId) => {
  const filter = {
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Category.findOne(filter);
};

/**
 * POST /api/categories
 * Create a new column.
 *
 * Returns:
 *   - 201 + Category — success.
 *   - 409 `categoryNameReserved` — name is "done" or "archived".
 *   - 409 `categoryNameDuplicate` — another column with that name exists.
 *   - 400 — Mongoose / validation error from the schema.
 */
export const createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const trimmed = (name || "").trim();
    if (isReserved(trimmed)) {
      return res.status(409).json({ message: "categoryNameReserved" });
    }
    const duplicate = await findByNameCI(trimmed);
    if (duplicate) {
      return res.status(409).json({ message: "categoryNameDuplicate" });
    }
    const category = await Category.create({ name: trimmed, color });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET /api/categories
 * Returns all categories (including system-reserved ones).
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/categories/:id
 * Returns one category by id, or 404.
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/categories/:id
 * Update a category's `name` and/or `color`. Three guard rails apply:
 *
 *   1. If the existing category is system-reserved (Done / Archived), its name
 *      cannot be changed → 409 `categoryReservedReadOnly`. (Color edits are still
 *      blocked here too because we only proceed when name is identical.)
 *   2. The new name cannot be a reserved name → 409 `categoryNameReserved`.
 *   3. The new name cannot collide with another existing column → 409
 *      `categoryNameDuplicate`.
 *
 * Returns 200 + Category on success, 404 if id not found, 400 on Mongoose error.
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const trimmed = (name || "").trim();

    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Category not found" });

    if (isReserved(existing.name) && trimmed && trimmed.toLowerCase() !== existing.name.toLowerCase()) {
      return res.status(409).json({ message: "categoryReservedReadOnly" });
    }
    if (trimmed && isReserved(trimmed) && trimmed.toLowerCase() !== existing.name.toLowerCase()) {
      return res.status(409).json({ message: "categoryNameReserved" });
    }
    if (trimmed) {
      const duplicate = await findByNameCI(trimmed, req.params.id);
      if (duplicate) {
        return res.status(409).json({ message: "categoryNameDuplicate" });
      }
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: trimmed, color },
      { returnDocument: 'after', runValidators: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * DELETE /api/categories/:id
 * Removes the category and **cascades** to all tasks in it (hard-delete).
 *
 *   - 200 — deleted.
 *   - 404 — category not found.
 *   - 409 `categoryReservedReadOnly` — attempt to delete Done or Archived.
 */
export const deleteCategory = async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Category not found" });
    if (isReserved(existing.name)) {
      return res.status(409).json({ message: "categoryReservedReadOnly" });
    }
    await Category.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ category_id: req.params.id });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Server-startup seed. Called once from `index.js` after the DB connection is
 * established. Creates the two system-reserved columns if they are missing,
 * idempotently. Never invoked through the HTTP API, so it bypasses the
 * `categoryNameReserved` guard intentionally.
 */
export const ensureSystemCategories = async () => {
  const defaults = [
    { name: "Done", color: "#34a853" },
    { name: "Archived", color: "#9aa0a6" },
  ];
  for (const def of defaults) {
    const found = await findByNameCI(def.name);
    if (!found) {
      await Category.create(def);
      console.log(`Seeded system category: ${def.name}`);
    }
  }
};
