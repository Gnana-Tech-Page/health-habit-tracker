/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E1F5EE', 100: '#9FE1CB', 200: '#5DCAA5',
          500: '#1D9E75', 700: '#0F6E56', 900: '#064e3b',
        },
        danger: { 500: '#E24B4A', 100: '#FCEBEB' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'sans-serif'],
      },
      keyframes: {
        'slide-in': { from: { transform: 'translateX(100%)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        'fade-in':  { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'slide-in': 'slide-in 0.25s ease-out',
        'fade-in':  'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
