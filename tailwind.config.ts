import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      borderRadius: {
        'xl': '0.625rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        primary: {
          50:  "#fdf3f4",
          100: "#fbe4e6",
          200: "#f6cdd2",
          300: "#efabb4",
          400: "#e47a88",
          500: "#DA251D",
          600: "#c71b14",
          700: "#a7130f",
          800: "#8b1310",
          900: "#741614",
          950: "#400605",
        },
        ink: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        success: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        warning: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
      },
      backgroundImage: {
        "prime-gradient":  "linear-gradient(135deg, #f03738 0%, #c71b14 100%)",
        "radial-glow":     "radial-gradient(circle at center, rgba(218,37,29,0.1) 0%, transparent 70%)"
      },
      boxShadow: {
        "prime":    "0 4px 20px rgba(218,37,29,0.15)",
        "prime-lg": "0 8px 32px rgba(218,37,29,0.25)",
        "card":     "0 2px 12px rgba(0,0,0,0.08)",
        "card-lg":  "0 8px 24px rgba(0,0,0,0.12)",
      },
      animation: {
        "fade-up":   "fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in":   "fadeIn 0.5s ease-out forwards",
        "slide-in":  "slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer":   "shimmer 2s infinite linear",
        "pulse-slow":"pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
