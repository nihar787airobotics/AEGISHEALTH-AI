import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: "#060b14",
          panel: "rgba(12, 20, 36, 0.72)",
          cyan: "#00d4ff",
          teal: "#00e5c0",
          blue: "#3b82f6",
        },
        risk: {
          low: "#22c55e",
          moderate: "#eab308",
          high: "#f97316",
          critical: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        pulse-glow: "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,255,0.12), transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
