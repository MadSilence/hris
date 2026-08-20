import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./public/desact/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  // `tailwindcss-animate` used to be listed here but is not a dependency — loading this file
  // would have thrown. Nothing imports it: Tailwind v4 is configured from globals.css.
  plugins: [forms, typography],
};

export default config;
