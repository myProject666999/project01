/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tcm-brown': '#8B4513',
        'tcm-brown-light': '#A0522D',
        'tcm-brown-dark': '#5D3A1A',
        'tcm-green': '#2E7D32',
        'tcm-green-light': '#4CAF50',
        'tcm-green-dark': '#1B5E20',
        'tcm-red': '#C62828',
        'tcm-red-light': '#EF5350',
        'tcm-beige': '#FAF8F5',
        'tcm-beige-dark': '#F5F0E8',
        'tcm-gold': '#D4AF37',
      },
      fontFamily: {
        'kai': ['KaiTi', 'STKaiti', 'serif'],
        'song': ['SimSun', 'STSong', 'serif'],
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
