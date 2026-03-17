import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Board from "../../components/Board";
import TaskForm from "../../components/TaskForm";
import CategoryForm from "../../components/CategoryForm";
import ConfirmForm from "../../components/ConfirmForm";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import categoryApi from "../../api/categoryAPI.js";
import taskApi from "../../api/taskAPI.js";
import styles from "./BoardPage.module.css";

export default function BoardPage() {
  const { t } = useTranslation();
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
      const [cats, tsks] = await Promise.all([categoryApi.getAll(), taskApi.getAll()]);
      setCategories(cats.data);
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
    } else {
      await taskApi.create(fields);
    }
    await fetchAll();
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
    } catch {
      await fetchAll();
    }
  };

  const handleCategoryReorder = (reordered) => setCategories(reordered);
  const handleAddCategory = () => setCategoryModal({ open: true, category: null });
  const handleEditCategory = (category) => setCategoryModal({ open: true, category });
  const handleDeleteCategory = (category) => setConfirmModal({ open: true, target: category, type: "category" });

  const handleCategorySubmit = async (fields) => {
    if (categoryModal.category) {
      await categoryApi.update(categoryModal.category._id, fields);
    } else {
      await categoryApi.create(fields);
    }
    await fetchAll();
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      if (confirmModal.type === "task") {
        await taskApi.remove(confirmModal.target._id);
      } else {
        await categoryApi.remove(confirmModal.target._id);
      }
      await fetchAll();
      setConfirmModal({ open: false, target: null, type: null });
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
        <LanguageSwitcher />
      </header>

      <Board
        categories={categories}
        tasks={tasks}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddCategory={handleAddCategory}
        onTaskDrop={handleTaskDrop}
        onCategoryReorder={handleCategoryReorder}
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