import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8ef",
          100: "#ffeed7",
          200: "#ffd7a8",
          300: "#ffbd73",
          400: "#ff9f3e",
          500: "#f98212",
          600: "#db6408",
          700: "#b44909",
          800: "#93390f",
          900: "#782f10",
        },
      },
    },
  },
  plugins: [],
};

export default config;
