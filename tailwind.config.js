/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: "#f8fafc",
        surface: "#ffffff",
        sidebar: "#ffffff",
        header: "#ffffff",
        border: {
          DEFAULT: "#e2e8f0",
          focus: "#0f172a",
        },
        text: {
          primary: "#0b1c30",
          secondary: "#64748b",
          muted: "#94a3b8",
          inverse: "#ffffff",
        },
        btn: {
          "primary-bg": "#0b1c30",
          "primary-hover": "#1e293b",
          "primary-text": "#ffffff",
          "secondary-bg": "#ffffff",
          "secondary-border": "#cbd5e1",
          "secondary-text": "#0b1c30",
          "secondary-hover": "#f1f5f9",
        },
        success: { DEFAULT: "#059669", light: "#ecfdf5", border: "#a7f3d0" },
        warning: { DEFAULT: "#d97706", light: "#fffbeb", border: "#fde68a" },
        danger: { DEFAULT: "#dc2626", light: "#fef2f2", border: "#fecaca" },
        info: { DEFAULT: "#2563eb", light: "#eff6ff", border: "#bfdbfe" },
        purple: { DEFAULT: "#7c3aed", light: "#f5f3ff", border: "#ddd6fe" },
      },
      fontFamily: {
        main: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        pill: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(15,23,42,0.05)",
        md: "0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.04)",
        modal: "0 20px 25px -5px rgba(15,23,42,0.15), 0 8px 10px -6px rgba(15,23,42,0.1)",
      },
    },
  },
  plugins: [],
};