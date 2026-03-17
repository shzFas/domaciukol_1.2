import styles from "./Input.module.css";

export default function Input({
  label,
  error,
  type = "text",
  placeholder,
  value,
  onChange,
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
      <input
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...rest}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
