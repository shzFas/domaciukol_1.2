import { useTranslation } from "react-i18next";
import Modal from "../Modal";
import Button from "../Button";
import styles from "./MoveTaskModal.module.css";

const isDoneCategory = (cat) =>
  cat?.name?.trim().toLowerCase() === "done";

export default function MoveTaskModal({
  isOpen,
  onClose,
  onMove,
  onArchive,
  task,
  categories,
  loading,
}) {
  const { t } = useTranslation();

  const currentCategoryId =
    task && (typeof task.category_id === "object"
      ? task.category_id._id
      : task.category_id);

  const targets = (categories || []).filter(
    (c) => !isDoneCategory(c) && c._id !== currentCategoryId,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("move.title", { name: task?.name || "" })}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("task.cancel")}
          </Button>
          <Button variant="danger" onClick={onArchive} loading={loading}>
            {t("move.archive")}
          </Button>
        </>
      }
    >
      <p className={styles.hint}>{t("move.hint")}</p>
      {targets.length === 0 ? (
        <p className={styles.empty}>{t("move.noColumns")}</p>
      ) : (
        <div className={styles.list}>
          {targets.map((c) => (
            <button
              key={c._id}
              type="button"
              className={styles.item}
              onClick={() => onMove(c._id)}
              disabled={loading}
            >
              <span
                className={styles.dot}
                style={{ background: c.color || "#1a73e8" }}
              />
              <span className={styles.name}>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
