// tailwind.config.js

const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
