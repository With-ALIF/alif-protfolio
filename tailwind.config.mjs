import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/component/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "Arial", "sans-serif"],
        heading: ["Poppins", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["dark", "business", "corporate"],
  },
};

export default config;
