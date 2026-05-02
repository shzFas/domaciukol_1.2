import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../Modal";
import Button from "../Button";
import styles from "./ArchiveModal.module.css";

export default function ArchiveModal({
  isOpen,
  onClose,
  archived,
  categories,
  onRestore,
  onDelete,
  loading,
}) {
  const { t } = useTranslation();
  const [picker, setPicker] = useState(null);

  const handleClose = () => {
    setPicker(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("archive.title")}
      footer={
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          {t("task.cancel")}
        </Button>
      }
    >
      {!archived || archived.length === 0 ? (
        <p className={styles.empty}>{t("archive.empty")}</p>
      ) : (
        <div className={styles.list}>
          {archived.map((task) => (
            <div key={task._id} className={styles.row}>
              <div className={styles.info}>
                <p className={styles.name}>{task.name}</p>
                {task.description && (
                  <p className={styles.description}>{task.description}</p>
                )}
              </div>
              <div className={styles.actions}>
                {picker === task._id ? (
                  <select
                    autoFocus
                    className={styles.select}
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onRestore(task, e.target.value);
                        setPicker(null);
                      }
                    }}
                    onBlur={() => setPicker(null)}
                  >
                    <option value="" disabled>
                      {t("archive.pickColumn")}
                    </option>
                    {categories
                      .filter(
                        (c) =>
                          c?.name?.trim().toLowerCase() !== "done",
                      )
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => setPicker(task._id)}
                      disabled={loading}
                      title={t("archive.restore")}
                    >
                      ↩ {t("archive.restore")}
                    </button>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.danger}`}
                      onClick={() => onDelete(task)}
                      disabled={loading}
                      title={t("task.delete")}
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
