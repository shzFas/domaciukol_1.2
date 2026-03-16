import Modal from "../Modal/Modal.jsx";
import Button from "../Button/Button.jsx";

export default function ConfirmForm({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || "Подтверждение"}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Отмена</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Удалить</Button>
        </>
      }
    >
      <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
        {message || "Вы уверены? Это действие нельзя отменить."}
      </p>
    </Modal>
  );
}