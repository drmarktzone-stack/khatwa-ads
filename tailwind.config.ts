import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        khatwa: {
          ink: "#143028",
          mute: "#4F6B5E",
          green: "#1B7F4E",
          "green-dark": "#145C39",
          "green-soft": "#E7F6EE",
          mint: "#F4FBF6",
          yellow: "#F5C518",
          "yellow-soft": "#FFF6D4",
          line: "#D7E8DC",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Tahoma", "sans-serif"],
        heebo: ["var(--font-heebo)", "Arial", "sans-serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 40px -18px rgba(20, 48, 40, 0.22)",
        cta: "0 12px 24px -10px rgba(27, 127, 78, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
