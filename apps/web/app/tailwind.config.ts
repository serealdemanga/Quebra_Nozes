import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Fundos
        "bg-primary":   "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-surface":   "var(--bg-surface)",
        "bg-inverse":   "var(--bg-inverse)",
        // Texto
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-disabled":  "var(--text-disabled)",
        // Marca
        "brand-primary": "var(--brand-primary)",
        "brand-accent":  "var(--brand-accent)",
        // Estados
        "state-success": "var(--state-success)",
        "state-warning": "var(--state-warning)",
        "state-error":   "var(--state-error)",
        // Borda
        "border-default": "var(--border-default)",
        "border-focus":   "var(--border-focus)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        card:    "0 4px 24px rgba(0, 0, 0, 0.4)",
        glow:    "0 0 16px rgba(86, 213, 222, 0.25)",
        "glow-accent": "0 0 16px rgba(247, 185, 85, 0.25)",
      },
      keyframes: {
        navProgress: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "nav-progress": "navProgress 1.1s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
