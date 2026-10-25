/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spotify: {
          base: '#121212',
          card: '#181818',
          cardHover: '#282828',
          elevated: '#242424',
          subdued: '#727272',
          muted: '#B3B3B3',
          light: '#FFFFFF',
          green: '#1DB954',
          greenHover: '#1ed760',
          dark: '#000000',
          border: '#2a2a2a',
        },
      },
      fontFamily: {
        sans: ['Circular Std', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
