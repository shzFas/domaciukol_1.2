import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";
import styles from "./CategoryForm.module.css";

const COLORS = [
  "#1a73e8",
  "#e53935",
  "#43a047",
  "#fb8c00",
  "#8e24aa",
  "#00acc1",
  "#6d4c41",
  "#546e7a",
];
const EMPTY = { name: "", color: "#1a73e8" };

export default function CategoryForm({ isOpen, onClose, onSubmit, category }) {
  const { t } = useTranslation();
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = (f) => {
    const e = {};
    if (!f.name.trim()) e.name = t("validation.nameRequired");
    if (f.name.trim().length > 50)
      e.name = t("validation.nameMaxLength", { max: 50 });
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(f.color))
      e.color = t("validation.invalidHex");
    return e;
  };

  useEffect(() => {
    if (!isOpen) return;
    setFields(
      category
        ? { name: category.name, color: category.color || "#1a73e8" }
        : EMPTY,
    );
    setErrors({});
  }, [isOpen, category]);

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
      title={category ? t("category.edit") : t("category.create")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("category.cancel")}
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {category ? t("category.save") : t("category.create")}
          </Button>
        </>
      }
    >
      <Input
        label={t("category.name")}
        required
        placeholder={t("category.namePlaceholder")}
        value={fields.name}
        onChange={set("name")}
        error={errors.name}
      />

      <div className={styles.colorField}>
        <label className={styles.label}>{t("category.color")}</label>
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
        <Input
          placeholder={t("category.colorPlaceholder")}
          value={fields.color}
          onChange={set("color")}
          error={errors.color}
        />
      </div>

      {errors.submit && <p className={styles.submitError}>{errors.submit}</p>}
    </Modal>
  );
}
