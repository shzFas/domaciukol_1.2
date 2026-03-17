import { useTranslation } from "react-i18next";
import Modal from "../Modal";
import Button from "../Button";

export default function ConfirmForm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t("confirm.title")}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("task.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {t("task.delete")}
          </Button>
        </>
      }
    >
      <p
        style={{
          fontSize: "14px",
          color: "var(--color-text-secondary)",
          lineHeight: 1.6,
        }}
      >
        {message || t("confirm.message")}
      </p>
    </Modal>
  );
}
