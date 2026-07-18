/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F19",
        darkCard: "#151B2C",
        accentBlue: "#2563EB",
        accentPurple: "#7C3AED",
        successGreen: "#10B981",
        warningYellow: "#F59E0B",
        dangerRed: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
