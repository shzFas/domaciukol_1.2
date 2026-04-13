import { useState, useEffect } from "react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      className={styles.btn}
      onClick={() => setDark((d) => !d)}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
