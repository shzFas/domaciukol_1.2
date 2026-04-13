import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "flag-icons/css/flag-icons.min.css";
import styles from "./LanguageSwitcher.module.css";

const LANGUAGES = [
  { code: "en", label: "EN", country: "gb" },
  { code: "ru", label: "RU", country: "ru" },
  { code: "cz", label: "CZ", country: "cz" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current =
    LANGUAGES.find((l) => i18n.language.startsWith(l.code)) ||
    LANGUAGES[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`fi fi-${current.country}`} />
        <span>{current.label}</span>
        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.option} ${i18n.language.startsWith(lang.code)
                  ? styles.active
                  : ""
                }`}
              onClick={() => handleSelect(lang.code)}
            >
              <span className={`fi fi-${lang.country}`} />
              <span>{lang.label}</span>

              {i18n.language.startsWith(lang.code) && (
                <span className={styles.check}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}