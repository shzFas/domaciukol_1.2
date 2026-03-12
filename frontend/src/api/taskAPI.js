import api from "./index.js";

const taskApi = {
  getAll: (categoryId) =>
    api.get("/tasks", {
      params: categoryId ? { category_id: categoryId } : {},
    }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export default taskApi;
