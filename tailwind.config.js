/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#ffffff',
          sidebar: '#f7f6f3',
          'sidebar-hover': '#efefef',
          'sidebar-active': '#e8e7e4',
          text: '#37352f',
          'text-secondary': '#787774',
          border: '#e9e8e7',
          accent: '#2383e2',
          'accent-hover': '#0b6bcb',
          red: '#eb5757',
          'red-bg': '#fce4e4',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
