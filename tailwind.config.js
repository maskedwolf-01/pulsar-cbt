/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0e17", // Deep Purple Void
        surface: "rgba(255, 255, 255, 0.05)",
        primary: "#a06cd5",    // Neon Purple
        secondary: "#00f5d4",  // Neon Cyan
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
        
