import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import Column from "../Column";
import TaskCard from "../TaskCard";
import styles from "./Board.module.css";

export default function Board({ categories, tasks, onAddTask, onEditTask, onDeleteTask,
  onEditCategory, onDeleteCategory, onAddCategory, onTaskDrop, onCategoryReorder }) {
  const { t } = useTranslation();
  const [activeTask, setActiveTask] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getTasksByCategory = (categoryId) =>
    tasks.filter((t) => t.category_id === categoryId || t.category_id?._id === categoryId);

  const handleDragStart = ({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    if (task) { setActiveTask(task); return; }
    const category = categories.find((c) => c._id === active.id);
    if (category) setActiveCategory(category);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    setActiveCategory(null);
    if (!over || active.id === over.id) return;

    const activeIsCategory = categories.some((c) => c._id === active.id);
    const overIsCategory = categories.some((c) => c._id === over.id);
    if (activeIsCategory && overIsCategory) {
      const oldIndex = categories.findIndex((c) => c._id === active.id);
      const newIndex = categories.findIndex((c) => c._id === over.id);
      onCategoryReorder(arrayMove(categories, oldIndex, newIndex));
      return;
    }

    const draggedTask = tasks.find((t) => t._id === active.id);
    if (!draggedTask) return;

    const overColumn = categories.find((c) => c._id === over.id);
    if (overColumn) { onTaskDrop(draggedTask, overColumn._id); return; }

    const overTask = tasks.find((t) => t._id === over.id);
    if (overTask) {
      const targetCategoryId = typeof overTask.category_id === "object" ? overTask.category_id._id : overTask.category_id;
      const activeCategoryId = typeof draggedTask.category_id === "object" ? draggedTask.category_id._id : draggedTask.category_id;
      if (activeCategoryId !== targetCategoryId) onTaskDrop(draggedTask, targetCategoryId);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={categories.map((c) => c._id)} strategy={horizontalListSortingStrategy}>
        <div className={styles.board}>
          {categories.map((category) => (
            <Column key={category._id} category={category}
              tasks={getTasksByCategory(category._id)}
              onAddTask={onAddTask} onEditTask={onEditTask} onDeleteTask={onDeleteTask}
              onEditCategory={onEditCategory} onDeleteCategory={onDeleteCategory} />
          ))}
          <button className={styles.addColumn} onClick={onAddCategory}>
            {t("board.addColumn")}
          </button>
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />}
        {activeCategory && (
          <div className={styles.columnOverlay}>
            <span className={styles.overlayDot} style={{ background: activeCategory.color || "#1a73e8" }} />
            {activeCategory.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}