/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          500: '#1D9E75',
          700: '#0F6E56',
          900: '#085041',
        },
        navy: '#1A2E44',
        amber: { 400: '#F59E0B', 100: '#FEF3C7' },
        danger: { 500: '#E24B4A', 100: '#FCEBEB' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
