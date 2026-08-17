import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: { 900: "#12181F", 700: "#3A4450", 400: "#8891A0" },
        paper: { 100: "#F6F5F1", 0: "#FFFFFF" },
        line: { 200: "#E4E2DB" },
        petrol: { 600: "#1E4258", 700: "#163242" },
        amber: { 500: "#D98E2C", 100: "#FBEBD3" },
        confirm: { 600: "#2E7D5B", 100: "#E1F0E8" },
        danger: { 600: "#B3402F", 100: "#F7E4E0" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: "12px", sm: "14px", base: "16px", lg: "18px", xl: "22px", "2xl": "28px",
      },
      spacing: { 1: "4px", 2: "8px", 3: "12px", 4: "16px", 6: "24px", 8: "32px", 12: "48px" },
      borderRadius: { DEFAULT: "8px", card: "12px" },
      screens: { tablet: "640px", desktop: "1024px" },
      maxWidth: { content: "960px" },
    },
  },
  plugins: [],
};

export default config;
