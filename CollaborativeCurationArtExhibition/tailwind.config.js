/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1a1a2e',
          light: '#252540',
          lighter: '#2a2a45',
          border: '#3a3a55',
        },
        gold: {
          DEFAULT: '#c9a96e',
          dark: '#a88a50',
          light: '#dfc08a',
        },
        cream: {
          DEFAULT: '#f5f0eb',
          dark: '#d4cfc8',
          muted: '#9a968f',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
