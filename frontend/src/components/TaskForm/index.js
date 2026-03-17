import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../Modal";
import Input from "../Input";
import Textarea from "../Textarea";
import Button from "../Button";
import styles from "./TaskForm.module.css";

const EMPTY = {
  name: "",
  description: "",
  deadline: "",
  status: "pending",
  category_id: "",
};

export default function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  task,
  categories,
  defaultCategoryId,
}) {
  const { t } = useTranslation();
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = t("validation.nameRequired");
    if (f.name.trim().length > 100)
      e.name = t("validation.nameMaxLength", { max: 100 });
    if (!f.category_id) e.category_id = t("validation.categoryRequired");
    if (f.deadline && isNaN(Date.parse(f.deadline)))
      e.deadline = t("validation.invalidDate");
    return e;
  };

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
              typeof task.category_id === "object"
                ? task.category_id._id
                : task.category_id || "",
          }
        : { ...EMPTY, category_id: defaultCategoryId || "" },
    );
    setErrors({});
  }, [isOpen, task, defaultCategoryId]);

  const set = (key) => (e) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(fields);
      onClose();
    } catch (e) {
      setErrors({
        submit: e.response?.data?.message || t("validation.serverError"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? t("task.edit") : t("task.create")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("task.cancel")}
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {task ? t("task.save") : t("task.create")}
          </Button>
        </>
      }
    >
      <Input
        label={t("task.name")}
        required
        placeholder={t("task.namePlaceholder")}
        value={fields.name}
        onChange={set("name")}
        error={errors.name}
      />

      <Textarea
        label={t("task.description")}
        placeholder={t("task.descriptionPlaceholder")}
        value={fields.description}
        onChange={set("description")}
        rows={3}
      />

      <Input
        label={t("task.deadline")}
        type="date"
        value={fields.deadline}
        onChange={set("deadline")}
        error={errors.deadline}
      />

      <div className={styles.field}>
        <label className={styles.label}>{t("task.status")}</label>
        <select
          className={styles.select}
          value={fields.status}
          onChange={set("status")}
        >
          <option value="pending">{t("task.statusPending")}</option>
          <option value="done">{t("task.statusDone")}</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t("task.category")} <span className={styles.required}>*</span>
        </label>
        <select
          className={`${styles.select} ${errors.category_id ? styles.selectError : ""}`}
          value={fields.category_id}
          onChange={set("category_id")}
        >
          <option value="">{t("task.categoryPlaceholder")}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <span className={styles.error}>{errors.category_id}</span>
        )}
      </div>

      {errors.submit && <p className={styles.submitError}>{errors.submit}</p>}
    </Modal>
  );
}
