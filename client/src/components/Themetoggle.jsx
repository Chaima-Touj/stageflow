// src/components/ThemeToggle.jsx

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <button
      className={`theme-toggle-btn ${isDark ? "dark" : "light"}`}
      onClick={toggleTheme}
      title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      aria-label="Toggle dark/light mode"
    >
      {/* Track */}
      <span className="toggle-track">
        {/* Stars (dark mode) */}
        <span className="toggle-stars">
          <span className="star s1" />
          <span className="star s2" />
          <span className="star s3" />
        </span>
        {/* Sun rays (light mode) */}
        <span className="toggle-rays">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="ray" style={{ "--i": i }} />
          ))}
        </span>
        {/* Thumb */}
        <span className="toggle-thumb">
          <span className="thumb-icon">
            {isDark ? "🌙" : "☀️"}
          </span>
        </span>
      </span>
    </button>
  );
}

export default ThemeToggle;