/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Avenir Next Cyr", "sans-serif"], // default font
      },
    },
  },
  plugins: [],
};
