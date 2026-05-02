import Task from "../models/Task.js";

/**
 * POST /api/tasks
 * Creates a new task. Validation is performed by `taskValidation` middleware
 * before this handler runs, so by the time we get here, `req.body` is shape-checked.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>} 201 with the created Task on success, 400 on Mongoose error.
 */
export const createTask = async (req, res) => {
  try {
    const { name, description, deadline, status, category_id } = req.body;
    const task = await Task.create({ name, description, deadline, status, category_id });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET /api/tasks
 * Lists tasks. Optional `category_id` query param scopes to a single column.
 * Always populates the `category_id` reference with `name` and `color`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getTasks = async (req, res) => {
  try {
    const { category_id } = req.query;
    const filter = category_id ? { category_id } : {};
    const tasks = await Task.find(filter).populate("category_id", "name color");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/tasks/:id
 * Returns one task by id, with `category_id` populated.
 * 404 if no document matches.
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("category_id", "name color");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/tasks/:id
 * Replaces the editable fields of a task. The frontend uses this single endpoint to
 * implement move (change `category_id`), mark done/pending (change `status`), and
 * archive/restore (set `category_id` to/from the system "Archived" column).
 */
export const updateTask = async (req, res) => {
  try {
    const { name, description, deadline, status, category_id } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { name, description, deadline, status, category_id },
      { returnDocument: 'after', runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * DELETE /api/tasks/:id
 * Permanently removes a task. Note: on the board UI, "delete" actually moves the
 * task to the Archived column instead — only the Archive view calls this endpoint
 * for true deletion.
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
