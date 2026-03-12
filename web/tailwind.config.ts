import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#101012",
        card: "#17171C",
        primary: "#3182F6",
        border: "rgba(255,255,255,0.1)",
        muted: "rgba(255,255,255,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
