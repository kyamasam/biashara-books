/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/hooks/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        app: {
          background: '#ffffff',
          text: '#000000',
          muted: '#60646C',
          element: '#F0F0F3',
          selected: '#E0E1E6',
          primary: '#007aff',
          success: '#19b45b',
        },
      },
    },
  },
  plugins: [],
};
