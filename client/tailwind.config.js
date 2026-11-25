/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arba: {
          dark: '#080d1a',
          card: '#0f172a',
          hover: '#1e293b',
          border: '#1e293b',
          cyan: '#00d2ff',
          blue: '#0284c7',
          accent: '#38bdf8',
          textMuted: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}
