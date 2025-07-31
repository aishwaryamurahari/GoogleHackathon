/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fbd7ac',
          300: '#f8bb77',
          400: '#f5953f',
          500: '#f2751a',
          600: '#e35d10',
          700: '#bc4510',
          800: '#963714',
          900: '#792f14',
        }
      }
    },
  },
  plugins: [],
}