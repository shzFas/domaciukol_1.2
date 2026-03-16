import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import Column from "../../components/Column/Column.jsx";
import TaskCard from "../../components/TaskCard/TaskCard.jsx";
import styles from "./Board.module.css";

export const BoardPage = ({
  categories,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
  onTaskDrop,
}) => {
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
    setActiveTask(task || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    // over is a column
    const overColumn = categories.find((c) => c._id === over.id);
    if (overColumn) {
      if (activeTask.category_id !== overColumn._id) {
        onTaskDrop(activeTask, overColumn._id);
      }
      return;
    }

    // over is a task — find its column
    const overTask = tasks.find((t) => t._id === over.id);
    if (overTask) {
      const targetCategoryId =
        typeof overTask.category_id === "object"
          ? overTask.category_id._id
          : overTask.category_id;

      const activeCategoryId =
        typeof activeTask.category_id === "object"
          ? activeTask.category_id._id
          : activeTask.category_id;

      if (activeCategoryId !== targetCategoryId) {
        onTaskDrop(activeTask, targetCategoryId);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
          + Добавить колонку
        </button>
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
        )}
      </DragOverlay>
    </DndContext>
  );
};
