import { useTranslation } from "react-i18next";
import styles from "./ArchiveButton.module.css";

export default function ArchiveButton({ count = 0, onClick }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.btn}
      onClick={onClick}
      title={t("archive.title")}
      aria-label={t("archive.title")}
    >
      <span className={styles.icon}>📦</span>
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}
