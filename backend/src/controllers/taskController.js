import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  try {
    const { name, description, deadline, status, category_id } = req.body;
    const task = await Task.create({ name, description, deadline, status, category_id });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};