/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: '#14342B',
        saffron: '#E3A41B',
        chili: '#A83B2D',
        ink: '#262522',
        cream: '#F6F6F1'
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif']
      }
    }
  },
  plugins: []
};