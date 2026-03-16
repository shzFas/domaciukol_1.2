import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
  const { setNodeRef, isOver } = useDroppable({ id: category._id });

  const taskIds = tasks.map((t) => t._id);

  return (
    <div className={styles.column}>
      {/* Header */}
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
            aria-label="Редактировать колонку"
          >
            ✏️
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => onDeleteCategory(category)}
            aria-label="Удалить колонку"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`${styles.cards} ${isOver ? styles.over : ""}`}
        >
          {tasks.length === 0 && (
            <p className={styles.empty}>Нет задач</p>
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
      </SortableContext>

      {/* Add task */}
      <button className={styles.addBtn} onClick={() => onAddTask(category._id)}>
        + Добавить задачу
      </button>
    </div>
  );
}