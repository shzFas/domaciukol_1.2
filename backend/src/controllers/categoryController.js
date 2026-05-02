import Category from "../models/Category.js";
import Task from "../models/Task.js";

const RESERVED_NAMES = ["done", "archived"];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isReserved = (name) =>
  RESERVED_NAMES.includes((name || "").trim().toLowerCase());

const findByNameCI = (name, excludeId) => {
  const filter = {
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Category.findOne(filter);
};

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

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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