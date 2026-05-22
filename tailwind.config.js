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
        marriott: {
          red: '#DC143C',
          darkRed: '#B22222',
          lightRed: '#FF6347',
          coral: '#FFA07A',
        }
      }
    },
  },
  plugins: [],
}
