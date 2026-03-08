import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await Category.create({ name, color });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};