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
        primary: '#E85D3A',
        'primary-light': '#F0856A',
        'primary-dark': '#C94A2A',
        secondary: '#5D4037',
        'secondary-light': '#795548',
        cream: '#FFF8F0',
        'cream-dark': '#F5E6D3',
      },
      fontSize: {
        'xl2': ['24px', { lineHeight: '1.4' }],
        'xl3': ['28px', { lineHeight: '1.4' }],
        'xl4': ['36px', { lineHeight: '1.3' }],
      },
      borderRadius: {
        'xl2': '16px',
        'xl3': '20px',
      },
      spacing: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
};
