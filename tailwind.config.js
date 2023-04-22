/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      opacity: ['disabled'],
    },
  },
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    'slate': '#5D616C',
    'saffron': '#F7C546',
    'purple': '#8C89AC',
  },
  plugins: [],
}