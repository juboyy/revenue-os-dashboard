import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: "#0a0f1a",
          800: "rgba(17,24,39,0.8)"
        },
        accent: {
          blue: "#3b82f6",
          green: "#10b981",
          yellow: "#f59e0b",
          red: "#ef4444",
          gray: "#6b7280"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular"]
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)"
      },
      animation: {
        pulseGlow: "pulseGlow 2s ease-in-out infinite"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.5)" },
          "50%": { boxShadow: "0 0 20px 6px rgba(16,185,129,0.35)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
