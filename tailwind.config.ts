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
        background: "#0f0e17",
        surface: "rgba(255, 255, 255, 0.05)",
        primary: "#a06cd5",
        secondary: "#00f5d4",
        text: "#fffffe",
        subtext: "#a7a9be",
      },
      backgroundImage: {
        'glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
