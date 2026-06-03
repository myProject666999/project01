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
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#165DFF',
          600: '#0e42cc',
          700: '#0a2e99',
          800: '#061f66',
          900: '#030f33',
        },
        warning: {
          50: '#fff4e6',
          100: '#ffe0b3',
          200: '#ffcc80',
          300: '#ffb84d',
          400: '#ffa31a',
          500: '#FF7D00',
          600: '#cc6400',
          700: '#994b00',
          800: '#663200',
          900: '#331900',
        },
        success: {
          50: '#e6f9ec',
          100: '#b3efc5',
          200: '#80e59e',
          300: '#4ddb77',
          400: '#1ad150',
          500: '#00B42A',
          600: '#009022',
          700: '#006c19',
          800: '#004811',
          900: '#002408',
        },
        danger: {
          50: '#fdeaea',
          100: '#f9c4c4',
          200: '#f59e9e',
          300: '#f17878',
          400: '#ed5252',
          500: '#F53F3F',
          600: '#c43232',
          700: '#932626',
          800: '#621919',
          900: '#310d0d',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
