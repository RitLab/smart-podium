/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    {
      pattern:
        /(text|from|to)-(blue|green|yellow|red|orange)-(50|100|500|600|700|800)/,
      variants: ["hover"],
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Avenir Next Cyr", "sans-serif"], // default font
      },
      keyframes: {
        slideIn: {
          "0%": { opacity: 0, transform: "translateX(100%)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
      },
    },
  },
  // corePlugins: {
  //   preflight: false,
  // },
  plugins: [],
};
