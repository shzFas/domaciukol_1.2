import { useTranslation } from "react-i18next";
import { useDroppable } from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: category._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  const taskIds = tasks.map((t) => t._id);

  return (
    <div ref={setSortableRef} style={style} className={styles.column}>
      <div className={styles.header} {...attributes} {...listeners}>
        <div className={styles.headerLeft}>
          <span
            className={styles.dot}
            style={{ background: category.color || "#1a73e8" }}
          />
          <h3 className={styles.title}>{category.name}</h3>
          <span className={styles.count}>{tasks.length}</span>
        </div>
        <div
          className={styles.headerActions}
          onClick={(e) => e.stopPropagation()}
        >
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

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setDroppableRef}
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
      </SortableContext>

      <button className={styles.addBtn} onClick={() => onAddTask(category._id)}>
        {t("board.addTask")}
      </button>
    </div>
  );
}
