import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0A0F1C",
          card: "#111827",
          elevated: "#1A2332",
          input: "#0D1320",
        },
        border: {
          DEFAULT: "#1E293B",
          active: "#334155",
          accent: "#F97316",
        },
        foreground: {
          DEFAULT: "#F8FAFC",
          secondary: "#94A3B8",
          tertiary: "#64748B",
          accent: "#FB923C",
        },
        primary: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#06B6D4",
        risco: {
          baixo: "#10B981",
          medio: "#F59E0B",
          alto: "#EF4444",
        },
        card: {
          DEFAULT: "#111827",
          foreground: "#F8FAFC",
        },
        muted: {
          DEFAULT: "#1A2332",
          foreground: "#94A3B8",
        },
        accent: {
          DEFAULT: "#1A2332",
          foreground: "#F8FAFC",
        },
        input: "#0D1320",
        ring: "#F97316",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        "hero": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "section": ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "card-title": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "caption": ["12px", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "500" }],
        "number-lg": ["36px", { lineHeight: "1.0", letterSpacing: "-0.02em", fontWeight: "700" }],
        "number-card": ["24px", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "600" }],
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        input: "10px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.3)",
        elevated: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(249,115,22,0.1)",
        glow: "0 0 40px rgba(249,115,22,0.15)",
        "glow-sm": "0 0 20px rgba(249,115,22,0.12)",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)",
        "gradient-card-highlight": "linear-gradient(180deg, rgba(249,115,22,0.1) 0%, transparent 100%)",
        "gradient-bg-radial": "radial-gradient(ellipse at top, rgba(249,115,22,0.05) 0%, transparent 50%)",
        "gradient-nav-active": "linear-gradient(90deg, rgba(249,115,22,0.15), transparent)",
        "shimmer": "linear-gradient(90deg, #111827 0%, #1A2332 50%, #111827 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(249,115,22,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(249,115,22,0.25)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        shimmer: "shimmer 1.5s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};

export default config;
