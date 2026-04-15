import { useTranslation } from "react-i18next";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "../TaskCard";
import styles from "./Column.module.css";

export default function Column({
  category,
  tasks = [],
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditCategory,
  onDeleteCategory,
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: category._id });

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span
            className={styles.dot}
            style={{ background: category.color || "#1a73e8" }}
          />
          <h3 className={styles.title}>{category.name}</h3>
          <span className={styles.count}>{tasks.length}</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.iconBtn}
            onClick={() => onEditCategory(category)}
          >
            ✏️
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => onDeleteCategory(category)}
          >
            🗑
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`${styles.cards} ${isOver ? styles.over : ""}`}
      >
        {tasks.length === 0 && (
          <p className={styles.empty}>{t("board.noTasks")}</p>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>

      <button className={styles.addBtn} onClick={() => onAddTask(category._id)}>
        {t("board.addTask")}
      </button>
    </div>
  );
}
