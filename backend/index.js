import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import connectDB from "./src/config/db.js";
import swaggerSpec from "./src/config/swagger.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import { ensureSystemCategories } from "./src/controllers/categoryController.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4444;

(async () => {
  await connectDB();
  try {
    await ensureSystemCategories();
  } catch (e) {
    console.error("Failed to seed system categories:", e.message);
  }
})();

app.use(cors());

app.use(express.json());

// Swagger UI — interactive API docs
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Task Manager API",
    swaggerOptions: { persistAuthorization: true },
  }),
);
// Raw OpenAPI JSON (for tooling, codegen, Postman import)
app.get("/api/docs.json", (req, res) => {
  res.json(swaggerSpec);
});

app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);

// глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Ошибка сервера" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api/docs`);
});
