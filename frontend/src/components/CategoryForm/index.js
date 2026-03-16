import { useState, useEffect } from "react";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";
import styles from "./CategoryForm.module.css";

const COLORS = ["#1a73e8", "#e53935", "#43a047", "#fb8c00", "#8e24aa", "#00acc1", "#6d4c41", "#546e7a"];
const EMPTY = { name: "", color: "#1a73e8" };

const validate = (f) => {
  const e = {};
  if (!f.name.trim()) e.name = "Название обязательно";
  if (f.name.trim().length > 50) e.name = "Максимум 50 символов";
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(f.color)) e.color = "Некорректный HEX цвет";
  return e;
};

export default function CategoryForm({ isOpen, onClose, onSubmit, category }) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFields(category ? { name: category.name, color: category.color || "#1a73e8" } : EMPTY);
    setErrors({});
  }, [isOpen, category]);

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
      title={category ? "Редактировать колонку" : "Новая колонка"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Отмена</Button>
          <Button onClick={handleSubmit} loading={loading}>
            {category ? "Сохранить" : "Создать"}
          </Button>
        </>
      }
    >
      <Input label="Название" required placeholder="Например: В работе"
        value={fields.name} onChange={set("name")} error={errors.name} />

      <div className={styles.colorField}>
        <label className={styles.label}>Цвет</label>
        <div className={styles.swatches}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.swatch} ${fields.color === c ? styles.selected : ""}`}
              style={{ background: c }}
              onClick={() => setFields((f) => ({ ...f, color: c }))}
            />
          ))}
        </div>
        <Input placeholder="#1a73e8" value={fields.color} onChange={set("color")} error={errors.color} />
      </div>

      {errors.submit && <p className={styles.submitError}>{errors.submit}</p>}
    </Modal>
  );
}