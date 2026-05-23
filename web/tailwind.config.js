/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Keep Watch global anchor colors
        'kw-black': '#2A2128',
        'kw-white': '#F4EFE6',
        'kw-grey': '#7A7480',
        'kw-green': '#7B9268',
        'kw-pink': '#E89BAA',
        // Warm Wood theme (default)
        'kw-wood': '#8B5E3C',
        'kw-water': '#5B8FA6',
        'kw-space': '#1B2233',
        'kw-room': '#A89478',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
};
