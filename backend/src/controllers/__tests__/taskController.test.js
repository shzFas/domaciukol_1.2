import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/Task.js", () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

const Task = (await import("../../models/Task.js")).default;
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = await import("../taskController.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createTask", () => {
  it("creates task and responds with 201", async () => {
    const body = {
      name: "Do homework",
      description: "Math",
      deadline: null,
      status: "pending",
      category_id: "c1",
    };
    const created = { _id: "t1", ...body };
    Task.create.mockResolvedValue(created);

    const res = mockRes();
    await createTask({ body }, res);

    expect(Task.create).toHaveBeenCalledWith(body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it("returns 400 on validation failure", async () => {
    Task.create.mockRejectedValue(new Error("name required"));

    const res = mockRes();
    await createTask({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "name required" });
  });
});

describe("getTasks", () => {
  it("returns all tasks when no filter is provided", async () => {
    const tasks = [{ _id: "t1" }, { _id: "t2" }];
    const populate = jest.fn().mockResolvedValue(tasks);
    Task.find.mockReturnValue({ populate });

    const res = mockRes();
    await getTasks({ query: {} }, res);

    expect(Task.find).toHaveBeenCalledWith({});
    expect(populate).toHaveBeenCalledWith("category_id", "name color");
    expect(res.json).toHaveBeenCalledWith(tasks);
  });

  it("filters by category_id when provided in the query", async () => {
    const populate = jest.fn().mockResolvedValue([]);
    Task.find.mockReturnValue({ populate });

    const res = mockRes();
    await getTasks({ query: { category_id: "c1" } }, res);

    expect(Task.find).toHaveBeenCalledWith({ category_id: "c1" });
  });

  it("returns 500 on DB error", async () => {
    Task.find.mockImplementation(() => {
      throw new Error("db error");
    });

    const res = mockRes();
    await getTasks({ query: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "db error" });
  });
});

describe("getTaskById", () => {
  it("returns the found task", async () => {
    const task = { _id: "t1", name: "X" };
    const populate = jest.fn().mockResolvedValue(task);
    Task.findById.mockReturnValue({ populate });

    const res = mockRes();
    await getTaskById({ params: { id: "t1" } }, res);

    expect(Task.findById).toHaveBeenCalledWith("t1");
    expect(res.json).toHaveBeenCalledWith(task);
  });

  it("returns 404 when not found", async () => {
    const populate = jest.fn().mockResolvedValue(null);
    Task.findById.mockReturnValue({ populate });

    const res = mockRes();
    await getTaskById({ params: { id: "x" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Task not found" });
  });
});

describe("updateTask", () => {
  it("updates and returns the new document", async () => {
    const updated = { _id: "t1", name: "New", status: "done" };
    Task.findByIdAndUpdate.mockResolvedValue(updated);

    const body = {
      name: "New",
      description: "",
      deadline: null,
      status: "done",
      category_id: "c1",
    };
    const res = mockRes();
    await updateTask({ params: { id: "t1" }, body }, res);

    expect(Task.findByIdAndUpdate).toHaveBeenCalledWith("t1", body, {
      returnDocument: "after",
      runValidators: true,
    });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it("returns 404 when the task is missing", async () => {
    Task.findByIdAndUpdate.mockResolvedValue(null);

    const res = mockRes();
    await updateTask({ params: { id: "x" }, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 400 on validation failure", async () => {
    Task.findByIdAndUpdate.mockRejectedValue(new Error("bad status"));

    const res = mockRes();
    await updateTask({ params: { id: "t1" }, body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "bad status" });
  });
});

describe("deleteTask", () => {
  it("deletes the task", async () => {
    Task.findByIdAndDelete.mockResolvedValue({ _id: "t1" });

    const res = mockRes();
    await deleteTask({ params: { id: "t1" } }, res);

    expect(Task.findByIdAndDelete).toHaveBeenCalledWith("t1");
    expect(res.json).toHaveBeenCalledWith({ message: "Task deleted" });
  });

  it("returns 404 when the task is missing", async () => {
    Task.findByIdAndDelete.mockResolvedValue(null);

    const res = mockRes();
    await deleteTask({ params: { id: "x" } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Task not found" });
  });

  it("returns 500 when the database call throws", async () => {
    Task.findByIdAndDelete.mockRejectedValue(new Error("db down"));

    const res = mockRes();
    await deleteTask({ params: { id: "x" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "db down" });
  });
});
