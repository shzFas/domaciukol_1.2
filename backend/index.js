import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4444;

connectDB();
app.use(cors());

app.use(express.json());

/* app.get("/", (req, res) => {
  res.send("Сервер запущен");
}); */

app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);

// глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Ошибка сервера" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
