/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Thmanyah", "sans-serif"],
      },
      colors: {
        primary: "#7C3AED",
        gold: "#F5C542",
        success: "#22C55E",
        danger: "#EF4444",
      },
      boxShadow: {
        premium: "0 24px 70px rgba(15, 23, 42, 0.26)",
        glow: "0 0 45px rgba(124, 58, 237, 0.42)",
      },
    },
  },
  plugins: [],
};
