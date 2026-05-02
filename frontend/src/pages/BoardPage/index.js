import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Board from "../../components/Board";
import TaskForm from "../../components/TaskForm";
import CategoryForm from "../../components/CategoryForm";
import ConfirmForm from "../../components/ConfirmForm";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeToggle from "../../components/ThemeToggle";
import { useSnackbar } from "../../components/Snackbar";
import categoryApi from "../../api/categoryAPI.js";
import taskApi from "../../api/taskAPI.js";
import styles from "./BoardPage.module.css";

export default function BoardPage() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [taskModal, setTaskModal] = useState({ open: false, task: null, categoryId: null });
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, target: null, type: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      let [catsRes, tsks] = await Promise.all([categoryApi.getAll(), taskApi.getAll()]);
      let cats = catsRes.data;

      // Auto-create a "Done" column when the board has no columns yet
      if (cats.length === 0) {
        await categoryApi.create({ name: "Done", color: "#34a853" });
        const res = await categoryApi.getAll();
        cats = res.data;
      }

      setCategories(cats);
      setTasks(tsks.data);
      setError(null);
    } catch {
      setError(t("board.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddTask = (categoryId) => setTaskModal({ open: true, task: null, categoryId });
  const handleEditTask = (task) => setTaskModal({ open: true, task, categoryId: null });
  const handleDeleteTask = (task) => setConfirmModal({ open: true, target: task, type: "task" });

  const handleTaskSubmit = async (fields) => {
    if (taskModal.task) {
      await taskApi.update(taskModal.task._id, fields);
      snackbar.success(t("snackbar.taskUpdated", { name: fields.name }));
    } else {
      await taskApi.create(fields);
      snackbar.success(t("snackbar.taskCreated", { name: fields.name }));
    }
    await fetchAll();
  };

  const getCategoryName = (id) => {
    const cat = categories.find((c) => c._id === id);
    return cat ? cat.name : "";
  };

  const handleTaskDrop = async (task, newCategoryId) => {
    const activeCategoryId =
      typeof task.category_id === "object" ? task.category_id._id : task.category_id;
    if (activeCategoryId === newCategoryId) return;
    setTasks((prev) =>
      prev.map((t) => t._id === task._id ? { ...t, category_id: newCategoryId } : t)
    );
    try {
      await taskApi.update(task._id, { ...task, category_id: newCategoryId });
      snackbar.success(
        t("snackbar.taskMoved", {
          name: task.name,
          column: getCategoryName(newCategoryId),
        }),
      );
    } catch {
      snackbar.error(t("snackbar.taskMoveFailed"));
      await fetchAll();
    }
  };

  const handleToggleDone = async (task) => {
    const nextStatus = task.status === "done" ? "pending" : "done";
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t)),
    );
    try {
      await taskApi.update(task._id, { ...task, status: nextStatus });
      snackbar.success(
        t(
          nextStatus === "done"
            ? "snackbar.taskMarkedDone"
            : "snackbar.taskMarkedPending",
          { name: task.name },
        ),
      );
    } catch {
      snackbar.error(t("snackbar.taskUpdateFailed"));
      await fetchAll();
    }
  };

  const handleDirectDeleteTask = async (task) => {
    try {
      await taskApi.remove(task._id);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      snackbar.success(t("snackbar.taskDeleted", { name: task.name }));
    } catch {
      snackbar.error(t("snackbar.taskDeleteFailed"));
      await fetchAll();
    }
  };

  const handleAddCategory = () => setCategoryModal({ open: true, category: null });
  const handleEditCategory = (category) => setCategoryModal({ open: true, category });
  const handleDeleteCategory = (category) => setConfirmModal({ open: true, target: category, type: "category" });

  const handleCategorySubmit = async (fields) => {
    if (categoryModal.category) {
      await categoryApi.update(categoryModal.category._id, fields);
      snackbar.success(t("snackbar.categoryUpdated", { name: fields.name }));
    } else {
      await categoryApi.create(fields);
      snackbar.success(t("snackbar.categoryCreated", { name: fields.name }));
    }
    await fetchAll();
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    const target = confirmModal.target;
    const type = confirmModal.type;
    try {
      if (type === "task") {
        await taskApi.remove(target._id);
        snackbar.success(t("snackbar.taskDeleted", { name: target?.name }));
      } else {
        await categoryApi.remove(target._id);
        snackbar.success(t("snackbar.categoryDeleted", { name: target?.name }));
      }
      await fetchAll();
      setConfirmModal({ open: false, target: null, type: null });
    } catch {
      snackbar.error(
        t(type === "task" ? "snackbar.taskDeleteFailed" : "snackbar.categoryDeleteFailed"),
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>{t("board.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <p className={styles.error}>{error}</p>
        <button className={styles.retry} onClick={fetchAll}>{t("board.retry")}</button>
      </div>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.logo}>📋 {t("board.title")}</h1>
        <div className={styles.headerRight}>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      <Board
        categories={categories}
        tasks={tasks}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onToggleDone={handleToggleDone}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddCategory={handleAddCategory}
        onTaskDrop={handleTaskDrop}
        onTaskTrash={handleDirectDeleteTask}
      />

      <TaskForm
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null, categoryId: null })}
        onSubmit={handleTaskSubmit}
        task={taskModal.task}
        categories={categories}
        defaultCategoryId={taskModal.categoryId}
      />

      <CategoryForm
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal({ open: false, category: null })}
        onSubmit={handleCategorySubmit}
        category={categoryModal.category}
      />

      <ConfirmForm
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, target: null, type: null })}
        onConfirm={handleConfirm}
        loading={confirmLoading}
        title={t(confirmModal.type === "task" ? "task.deleteTitle" : "category.deleteTitle")}
        message={t(
          confirmModal.type === "task" ? "task.deleteMessage" : "category.deleteMessage",
          { name: confirmModal.target?.name }
        )}
      />
    </>
  );
}
