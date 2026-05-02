import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import styles from "./Snackbar.module.css";

const SnackbarContext = createContext(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used inside <SnackbarProvider>");
  }
  return ctx;
}

export function SnackbarProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setItems((arr) => arr.filter((s) => s.id !== id));
  }, []);

  const show = useCallback(
    (message, variant = "info", duration = 2500) => {
      const id = ++idRef.current;
      setItems((arr) => [...arr, { id, message, variant }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const api = useRef({
    show,
    success: (m, d) => show(m, "success", d),
    error: (m, d) => show(m, "error", d),
    info: (m, d) => show(m, "info", d),
  });

  useEffect(() => {
    api.current.show = show;
    api.current.success = (m, d) => show(m, "success", d);
    api.current.error = (m, d) => show(m, "error", d);
    api.current.info = (m, d) => show(m, "info", d);
  }, [show]);

  return (
    <SnackbarContext.Provider value={api.current}>
      {children}
      <div className={styles.container} aria-live="polite">
        {items.map((s) => (
          <div
            key={s.id}
            className={`${styles.snack} ${styles[s.variant]}`}
            onClick={() => dismiss(s.id)}
            role="status"
          >
            <span className={styles.icon}>
              {s.variant === "success" && "✓"}
              {s.variant === "error" && "⚠"}
              {s.variant === "info" && "ℹ"}
            </span>
            <span className={styles.message}>{s.message}</span>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}
