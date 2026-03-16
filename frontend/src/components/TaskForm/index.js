import { useState, useEffect } from "react";
import Modal from "../Modal/Modal.jsx";
import Input from "../Input/Input.jsx";
import Textarea from "../Textarea/Textarea.jsx";
import Button from "../Button/Button.jsx";
import styles from "./TaskForm.module.css";

const EMPTY = { name: "", description: "", deadline: "", status: "pending", category_id: "" };

const validate = (f) => {
  const e = {};
  if (!f.name.trim()) e.name = "Название обязательно";
  if (f.name.trim().length > 100) e.name = "Максимум 100 символов";
  if (!f.category_id) e.category_id = "Выберите категорию";
  if (f.deadline && isNaN(Date.parse(f.deadline))) e.deadline = "Некорректная дата";
  return e;
};

export default function TaskForm({ isOpen, onClose, onSubmit, task, categories, defaultCategoryId }) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFields(
      task
        ? {
            name: task.name || "",
            description: task.description || "",
            deadline: task.deadline ? task.deadline.slice(0, 10) : "",
            status: task.status || "pending",
            category_id:
              typeof task.category_id === "object" ? task.category_id._id : task.category_id || "",
          }
        : { ...EMPTY, category_id: defaultCategoryId || "" }
    );
    setErrors({});
  }, [isOpen, task, defaultCategoryId]);

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSubmit(fields);
      onClose();
    } catch (e) {
      setErrors({ submit: e.response?.data?.message || "Ошибка сервера" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Редактировать задачу" : "Новая задача"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Отмена</Button>
          <Button onClick={handleSubmit} loading={loading}>
            {task ? "Сохранить" : "Создать"}
          </Button>
        </>
      }
    >
      <Input label="Название" required placeholder="Введите название задачи"
        value={fields.name} onChange={set("name")} error={errors.name} />

      <Textarea label="Описание" placeholder="Подробное описание (необязательно)"
        value={fields.description} onChange={set("description")} rows={3} />

      <Input label="Дедлайн" type="date"
        value={fields.deadline} onChange={set("deadline")} error={errors.deadline} />

      <div className={styles.field}>
        <label className={styles.label}>Статус</label>
        <select className={styles.select} value={fields.status} onChange={set("status")}>
          <option value="pending">● Невыполнено</option>
          <option value="done">✓ Выполнено</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Категория <span className={styles.required}>*</span>
        </label>
        <select
          className={`${styles.select} ${errors.category_id ? styles.selectError : ""}`}
          value={fields.category_id}
          onChange={set("category_id")}
        >
          <option value="">— Выберите категорию —</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        {errors.category_id && <span className={styles.error}>{errors.category_id}</span>}
      </div>

      {errors.submit && <p className={styles.submitError}>{errors.submit}</p>}
    </Modal>
  );
}