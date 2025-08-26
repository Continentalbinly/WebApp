/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#06A764',
        secondary: '#013F81',
        background: '#FFFFFF',
        text: {
          DEFAULT: '#000000',
          white: '#FFFFFF',
        }
      },
    },
  },
  plugins: [],
}
