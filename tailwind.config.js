/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#030305',     // Deepest black
        obsidian: '#0A0F14', // Secondary bg
        cyber: {
          cyan: '#00F0FF',   // Primary neon
          red: '#FF003C',    // Alert/Danger
          yellow: '#FCEE0A', // Warning/Accent
          purple: '#BC13FE', // Secondary accent
        },
        glass: {
          100: 'rgba(255, 255, 255, 0.05)',
          200: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        mono: ['var(--font-jetbrains)', 'monospace'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)",
        'cyber-gradient': "linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(3,3,5,0) 100%)",
      },
      boxShadow: {
        'neon-cyan': '0 0 5px theme("colors.cyber.cyan"), 0 0 20px theme("colors.cyber.cyan")',
        'neon-red': '0 0 5px theme("colors.cyber.red"), 0 0 20px theme("colors.cyber.red")',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
