/** @type {import('tailwindcss').Config} */
import tailwindScrollbar from "tailwind-scrollbar";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          100: "#1a1b26",
          200: "#16161e",
          300: "#13131a",
        },
        accent: {
          blue: "#7aa2f7",
          purple: "#bb9af7",
        },
        pastelBlue: "#bb9af7",
      },
    },
  },
  plugins: [tailwindScrollbar],
};
