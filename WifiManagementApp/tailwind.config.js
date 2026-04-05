/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f1a",
        card: "#1e1e2e",
        "card-alt": "#252535",
        "card-darker": "#1a1a2e",
        accent: "#00d4aa",
        "accent-purple": "#8b5cf6",
        "accent-pink": "#f472b6",
        border: "#2a2a3e",
        "text-muted": "#94a3b8",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
