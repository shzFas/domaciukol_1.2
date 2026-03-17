import styles from "./Textarea.module.css";

export default function Textarea({
  label,
  error,
  placeholder,
  value,
  onChange,
  rows = 3,
  required = false,
  disabled = false,
  ...rest
}) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}
      <textarea
        className={`${styles.textarea} ${error ? styles.textareaError : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        {...rest}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
