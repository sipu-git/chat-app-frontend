/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 REQUIRED for your toggler
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
