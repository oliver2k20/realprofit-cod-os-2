import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        panel: "#0F1A2D",
        panel2: "#0C1526",
        border: "rgba(255,255,255,0.08)",
        text: "rgba(255,255,255,0.92)",
        mutetext: "rgba(255,255,255,0.70)",
        blueglow: "#2D6BFF",
        green: "#22c55e",
        red: "#ef4444",
        yellow: "#f59e0b",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,0.35)",
      },
      borderRadius: {
        xl2: "1rem",
      }
    },
  },
  plugins: [],
};
export default config;
