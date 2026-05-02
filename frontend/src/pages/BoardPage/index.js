import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Board from "../../components/Board";
import TaskForm from "../../components/TaskForm";
import CategoryForm from "../../components/CategoryForm";
import ConfirmForm from "../../components/ConfirmForm";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ThemeToggle from "../../components/ThemeToggle";
import ArchiveButton from "../../components/ArchiveButton";
import ArchiveModal from "../../components/ArchiveModal";
import MoveTaskModal from "../../components/MoveTaskModal";
import { useSnackbar } from "../../components/Snackbar";
import categoryApi from "../../api/categoryAPI.js";
import taskApi from "../../api/taskAPI.js";
import styles from "./BoardPage.module.css";

const nameIs = (cat, target) =>
  cat?.name?.trim().toLowerCase() === target;

const isDoneCategory = (cat) => nameIs(cat, "done");
const isArchivedCategory = (cat) => nameIs(cat, "archived");
const isReservedCategory = (cat) =>
  isDoneCategory(cat) || isArchivedCategory(cat);

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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [moveModal, setMoveModal] = useState({ open: false, task: null });
  const [moveLoading, setMoveLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [catsRes, tsks] = await Promise.all([
        categoryApi.getAll(),
        taskApi.getAll(),
      ]);
      setCategories(catsRes.data);
      setTasks(tsks.data);
      setError(null);
    } catch {
      setError(t("board.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const archivedCategory = useMemo(
    () => categories.find(isArchivedCategory),
    [categories],
  );
  const doneCategory = useMemo(
    () => categories.find(isDoneCategory),
    [categories],
  );

  const archivedCategoryId = archivedCategory?._id;

  const taskCategoryId = (task) =>
    typeof task.category_id === "object" ? task.category_id._id : task.category_id;

  const isTaskArchived = (task) => taskCategoryId(task) === archivedCategoryId;

  const visibleTasks = useMemo(
    () => tasks.filter((tk) => !isTaskArchived(tk)),
    [tasks, archivedCategoryId],
  );
  const archivedTasks = useMemo(
    () => tasks.filter(isTaskArchived),
    [tasks, archivedCategoryId],
  );

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
    const activeCategoryId = taskCategoryId(task);
    if (activeCategoryId === newCategoryId) return;

    const newColumn = categories.find((c) => c._id === newCategoryId);
    const oldColumn = categories.find((c) => c._id === activeCategoryId);
    let newStatus = task.status;
    if (isDoneCategory(newColumn)) newStatus = "done";
    else if (isDoneCategory(oldColumn)) newStatus = "pending";

    setTasks((prev) =>
      prev.map((tk) =>
        tk._id === task._id
          ? { ...tk, category_id: newCategoryId, status: newStatus }
          : tk,
      ),
    );
    try {
      await taskApi.update(task._id, {
        ...task,
        category_id: newCategoryId,
        status: newStatus,
      });
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

  // ✓ button. Not in Done → move to Done. In Done → ask where to move.
  const handleToggleDone = async (task) => {
    const currentCategory = categories.find(
      (c) => c._id === taskCategoryId(task),
    );

    if (isDoneCategory(currentCategory)) {
      setMoveModal({ open: true, task });
      return;
    }

    if (!doneCategory) {
      snackbar.error(t("snackbar.noDoneColumn"));
      return;
    }

    setTasks((prev) =>
      prev.map((tk) =>
        tk._id === task._id
          ? { ...tk, status: "done", category_id: doneCategory._id }
          : tk,
      ),
    );
    try {
      await taskApi.update(task._id, {
        ...task,
        status: "done",
        category_id: doneCategory._id,
      });
      snackbar.success(t("snackbar.taskMarkedDone", { name: task.name }));
    } catch {
      snackbar.error(t("snackbar.taskUpdateFailed"));
      await fetchAll();
    }
  };

  const archiveTask = async (task) => {
    if (!archivedCategory) {
      snackbar.error(t("snackbar.noArchiveColumn"));
      throw new Error("No archive column");
    }
    await taskApi.update(task._id, {
      ...task,
      category_id: archivedCategory._id,
      status: "pending",
    });
  };

  const handleMoveSubmit = async (newCategoryId) => {
    const task = moveModal.task;
    if (!task) return;
    setMoveLoading(true);
    try {
      await taskApi.update(task._id, {
        ...task,
        category_id: newCategoryId,
        status: "pending",
      });
      snackbar.success(
        t("snackbar.taskMoved", {
          name: task.name,
          column: getCategoryName(newCategoryId),
        }),
      );
      setMoveModal({ open: false, task: null });
      await fetchAll();
    } catch {
      snackbar.error(t("snackbar.taskMoveFailed"));
    } finally {
      setMoveLoading(false);
    }
  };

  const handleArchiveFromMove = async () => {
    const task = moveModal.task;
    if (!task) return;
    setMoveLoading(true);
    try {
      await archiveTask(task);
      snackbar.success(t("snackbar.taskArchived", { name: task.name }));
      setMoveModal({ open: false, task: null });
      await fetchAll();
    } catch {
      snackbar.error(t("snackbar.taskArchiveFailed"));
    } finally {
      setMoveLoading(false);
    }
  };

  const handleRestoreArchived = async (task, categoryId) => {
    try {
      await taskApi.update(task._id, {
        ...task,
        category_id: categoryId,
        status: "pending",
      });
      snackbar.success(
        t("snackbar.taskRestored", {
          name: task.name,
          column: getCategoryName(categoryId),
        }),
      );
      await fetchAll();
    } catch {
      snackbar.error(t("snackbar.taskRestoreFailed"));
    }
  };

  const handleDeleteArchived = async (task) => {
    try {
      await taskApi.remove(task._id);
      snackbar.success(t("snackbar.taskDeleted", { name: task.name }));
      await fetchAll();
    } catch {
      snackbar.error(t("snackbar.taskDeleteFailed"));
    }
  };

  const handleDirectDeleteTask = async (task) => {
    setTasks((prev) =>
      prev.map((tk) =>
        tk._id === task._id
          ? { ...tk, category_id: archivedCategoryId }
          : tk,
      ),
    );
    try {
      await archiveTask(task);
      snackbar.success(t("snackbar.taskArchived", { name: task.name }));
      await fetchAll();
    } catch {
      snackbar.error(t("snackbar.taskArchiveFailed"));
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
        await archiveTask(target);
        snackbar.success(t("snackbar.taskArchived", { name: target?.name }));
      } else {
        await categoryApi.remove(target._id);
        snackbar.success(t("snackbar.categoryDeleted", { name: target?.name }));
      }
      await fetchAll();
      setConfirmModal({ open: false, target: null, type: null });
    } catch {
      snackbar.error(
        t(type === "task" ? "snackbar.taskArchiveFailed" : "snackbar.categoryDeleteFailed"),
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
          <ArchiveButton
            count={archivedTasks.length}
            onClick={() => setArchiveOpen(true)}
          />
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>

      <Board
        categories={categories}
        tasks={visibleTasks}
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
        categories={categories.filter((c) => !isReservedCategory(c) || isDoneCategory(c))}
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

      <MoveTaskModal
        isOpen={moveModal.open}
        onClose={() => setMoveModal({ open: false, task: null })}
        onMove={handleMoveSubmit}
        onArchive={handleArchiveFromMove}
        task={moveModal.task}
        categories={categories.filter((c) => !isArchivedCategory(c))}
        loading={moveLoading}
      />

      <ArchiveModal
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        archived={archivedTasks}
        categories={categories.filter((c) => !isReservedCategory(c))}
        onRestore={handleRestoreArchived}
        onDelete={handleDeleteArchived}
      />
    </>
  );
}
