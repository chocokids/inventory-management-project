/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfcfb',
          100: '#faf7f5',
          200: '#f5ede7',
          300: '#ede1d6',
          400: '#e3d0bf',
          500: '#d4b8a1',
        },
        coffee: {
          100: '#e8d5c4',
          200: '#d4b896',
          300: '#b8936d',
          400: '#9c6f47',
          500: '#7d5a3a',
          600: '#5f442c',
          700: '#42301f',
        },
      },
    },
  },
  plugins: [],
}




