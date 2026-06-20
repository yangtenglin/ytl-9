/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        paper: {
          50: "#fdfcf9",
          100: "#faf6f0",
          200: "#f5ede0",
          300: "#e8dcc8",
        },
        ink: {
          500: "#8b7355",
          600: "#6b5344",
          700: "#5a4535",
        },
        tape: {
          pink: "#f8b4b4",
          orange: "#e8a87c",
          yellow: "#f6e58d",
          green: "#88d8b0",
          blue: "#8ecae6",
        },
      },
      fontFamily: {
        handwritten: ['"Caveat"', 'cursive'],
        serif: ['"Noto Serif SC"', 'serif'],
        mono: ['"Courier Prime"', 'monospace'],
      },
      boxShadow: {
        'paper': '2px 3px 8px rgba(139, 115, 85, 0.15)',
        'paper-lg': '4px 6px 16px rgba(139, 115, 85, 0.2)',
        'stamp': '0 0 0 2px #8b7355, 0 0 0 4px #faf6f0, 0 0 0 6px #8b7355',
      },
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'stamp': 'stamp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        stamp: {
          '0%': { transform: 'scale(1.5) rotate(-5deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
