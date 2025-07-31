/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7B8B4F',
        background: '#F2F0EC',
        accent: '#8B4F7B',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['PT Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
