import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/Category.js", () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/Task.js", () => ({
  default: {
    deleteMany: jest.fn(),
  },
}));

const Category = (await import("../../models/Category.js")).default;
const Task = (await import("../../models/Task.js")).default;
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = await import("../categoryController.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createCategory", () => {
  it("creates category and responds with 201", async () => {
    const body = { name: "Work", color: "#fff" };
    const created = { _id: "1", ...body };
    Category.create.mockResolvedValue(created);

    const res = mockRes();
    await createCategory({ body }, res);

    expect(Category.create).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it("returns 400 on validation failure", async () => {
    Category.create.mockRejectedValue(new Error("name required"));

    const res = mockRes();
    await createCategory({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "name required" });
  });
});

describe("getCategories", () => {
  it("returns the full list", async () => {
    const list = [{ _id: "1" }, { _id: "2" }];
    Category.find.mockResolvedValue(list);

    const res = mockRes();
    await getCategories({}, res);

    expect(res.json).toHaveBeenCalledWith(list);
  });

  it("returns 500 on DB error", async () => {
    Category.find.mockRejectedValue(new Error("boom"));

    const res = mockRes();
    await getCategories({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "boom" });
  });
});

describe("getCategoryById", () => {
  it("returns the found category", async () => {
    const cat = { _id: "1", name: "Work" };
    Category.findById.mockResolvedValue(cat);

    const res = mockRes();
    await getCategoryById({ params: { id: "1" } }, res);

    expect(Category.findById).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith(cat);
  });

  it("returns 404 when not found", async () => {
    Category.findById.mockResolvedValue(null);

    const res = mockRes();
    await getCategoryById({ params: { id: "x" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
  });
});

describe("updateCategory", () => {
  it("updates and returns the new document", async () => {
    const updated = { _id: "1", name: "New", color: "#000" };
    Category.findByIdAndUpdate.mockResolvedValue(updated);

    const req = { params: { id: "1" }, body: { name: "New", color: "#000" } };
    const res = mockRes();
    await updateCategory(req, res);

    expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      { name: "New", color: "#000" },
      { returnDocument: "after", runValidators: true }
    );
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it("returns 404 when the category is missing", async () => {
    Category.findByIdAndUpdate.mockResolvedValue(null);

    const res = mockRes();
    await updateCategory({ params: { id: "x" }, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 400 on validation failure", async () => {
    Category.findByIdAndUpdate.mockRejectedValue(new Error("bad color"));

    const res = mockRes();
    await updateCategory({ params: { id: "1" }, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "bad color" });
  });
});

describe("deleteCategory", () => {
  it("deletes category and cascades deletion to its tasks", async () => {
    const categoryId = "507f1f77bcf86cd799439011";
    Category.findByIdAndDelete.mockResolvedValue({ _id: categoryId, name: "Work" });
    Task.deleteMany.mockResolvedValue({ deletedCount: 3 });

    const res = mockRes();
    await deleteCategory({ params: { id: categoryId } }, res);

    expect(Category.findByIdAndDelete).toHaveBeenCalledWith(categoryId);
    expect(Task.deleteMany).toHaveBeenCalledWith({ category_id: categoryId });
    expect(res.json).toHaveBeenCalledWith({ message: "Category deleted" });
  });

  it("returns 404 and does not delete tasks when category is missing", async () => {
    Category.findByIdAndDelete.mockResolvedValue(null);

    const res = mockRes();
    await deleteCategory({ params: { id: "missing" } }, res);

    expect(Task.deleteMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Category not found" });
  });

  it("returns 500 when the database call throws", async () => {
    Category.findByIdAndDelete.mockRejectedValue(new Error("db down"));

    const res = mockRes();
    await deleteCategory({ params: { id: "any" } }, res);

    expect(Task.deleteMany).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "db down" });
  });
});
