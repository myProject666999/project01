/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1B4332',
          600: '#163A2B',
          700: '#123024',
          800: '#0D261C',
          900: '#081C15',
        },
        rescue: {
          orange: '#E76F51',
          'orange-light': '#F4A261',
          'orange-dark': '#C4533A',
          blue: '#2196F3',
          red: '#F44336',
          green: '#4CAF50',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
