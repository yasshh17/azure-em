import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "em-bg": "#080C14",
        "em-surface": "#0F1623",
        "em-deep": "#0A1020",
        "em-border": "#1C2333",
        "em-gold": "#D4AF72",
        "em-gold-hover": "#E8C987",
        "em-text": "#F0EDE8",
        "em-muted": "#6B7A99",
        "em-success": "#4ADE80",
        "em-warn": "#F59E0B",
        "em-danger": "#F87171",
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "serif"],
        dm: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
