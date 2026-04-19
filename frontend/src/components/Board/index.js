import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import Column from "../Column";
import TaskCard from "../TaskCard";
import styles from "./Board.module.css";

const TRASH_ID = "trash-zone";

function TrashZone({ visible }) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: TRASH_ID });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.trashZone} ${visible ? styles.trashVisible : ""} ${isOver ? styles.trashOver : ""}`}
    >
      🗑 {t("board.trashZone")}
    </div>
  );
}

export default function Board({
  categories,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
  onTaskDrop,
  onTaskTrash,
}) {
  const { t } = useTranslation();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const getTasksByCategory = (categoryId) =>
    tasks.filter(
      (t) => t.category_id === categoryId || t.category_id?._id === categoryId,
    );

  const handleDragStart = ({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    if (over.id === TRASH_ID) {
      const draggedTask = tasks.find((t) => t._id === active.id);
      if (draggedTask) onTaskTrash(draggedTask);
      return;
    }

    if (active.id === over.id) return;

    const draggedTask = tasks.find((t) => t._id === active.id);
    if (!draggedTask) return;

    const overColumn = categories.find((c) => c._id === over.id);
    if (overColumn) {
      onTaskDrop(draggedTask, overColumn._id);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.board}>
        {categories.map((category) => (
          <Column
            key={category._id}
            category={category}
            tasks={getTasksByCategory(category._id)}
            onAddTask={onAddTask}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onEditCategory={onEditCategory}
            onDeleteCategory={onDeleteCategory}
          />
        ))}
        <button className={styles.addColumn} onClick={onAddCategory}>
          {t("board.addColumn")}
        </button>
      </div>

      <TrashZone visible={!!activeTask} />

      <DragOverlay>
        {activeTask && (
          <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
