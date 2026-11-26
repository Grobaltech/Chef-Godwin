/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: '#0B3B2E',
        saffron: '#D8A52B',
        chili: '#A52A2A',
        ink: '#211F18',
        cream: '#FFF9E8',
        parchment: '#F4E9C9',
        gold: '#D8A52B'
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif']
      }
    }
  },
  plugins: []
};
