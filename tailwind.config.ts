import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#060a14",
        ocean: {
          950: "#040810",
          900: "#0a0f1a",
          800: "#111827",
          700: "#1f2937",
          600: "#374151",
        },
        accent: {
          blue: "#3b82f6",
          green: "#10b981",
          amber: "#f59e0b",
          red: "#ef4444",
          purple: "#8b5cf6",
          cyan: "#06b6d4",
          pink: "#ec4899",
        },
        glass: {
          DEFAULT: "rgba(17, 24, 39, 0.6)",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(59, 130, 246, 0.08)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
        glow: "0 0 20px rgba(59, 130, 246, 0.25)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.25)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.25)",
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.5)" },
          "50%": { boxShadow: "0 0 20px 6px rgba(16,185,129,0.35)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
