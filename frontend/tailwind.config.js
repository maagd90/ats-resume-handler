/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        accent: {
          indigo: "#6366f1",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f4f4f5",
        },
        muted: {
          DEFAULT: "#e4e4e7",
          foreground: "#71717a",
        },
        border: "rgba(0, 0, 0, 0.08)",
        foreground: "#18181b",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        panel: "0 8px 30px -12px rgb(15 23 42 / 0.12)",
      },
      borderRadius: {
        lg: "0.625rem",
      },
    },
  },
  plugins: [],
};
