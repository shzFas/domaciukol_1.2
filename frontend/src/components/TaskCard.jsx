import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./TaskCard.module.css";

export default function TaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    task.deadline &&
    task.status !== "done" &&
    new Date(task.deadline) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${task.status === "done" ? styles.done : ""} ${isDragging ? styles.dragging : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.top}>
        <span className={`${styles.status} ${styles[task.status]}`}>
          {task.status === "done" ? "✓" : "●"}
        </span>
        <p className={styles.name}>{task.name}</p>
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {task.deadline && (
        <p className={`${styles.deadline} ${isOverdue ? styles.overdue : ""}`}>
          📅 {new Date(task.deadline).toLocaleDateString("cs-CZ")}
        </p>
      )}

      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          aria-label="Редактировать"
        >
          ✏️
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          aria-label="Удалить"
        >
          🗑
        </button>
      </div>
    </div>
  );
}