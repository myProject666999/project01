/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f0e8',
          100: '#e8dfd0',
          200: '#d3c6ae',
          300: '#b8a686',
          400: '#9e8a64',
          500: '#7a6a4f',
          600: '#5e523d',
          700: '#4a4032',
          800: '#352e26',
          900: '#1a1a2e',
        },
        vermilion: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#c0392b',
          600: '#a93226',
          700: '#7b241c',
          800: '#641e16',
          900: '#450a0a',
        },
        indigo: {
          500: '#2c3e7a',
          600: '#253464',
        },
        pine: {
          500: '#1e6b52',
          600: '#195642',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        kai: ['"LXGW WenKai"', '"Noto Serif SC"', 'Georgia', 'serif'],
        crimson: ['"Crimson Pro"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
