/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0E5A3A', // Deep Forest Green
          light: '#145A43',
          dark: '#083D29',
        },
        accent: {
          DEFAULT: '#E85A2D', // Burnt Orange
          light: '#F07D54',
          dark: '#C14622',
        },
        surface: {
          DEFAULT: '#F4F1E9', // Cream Beige background
          card: '#FAF9F6',
          input: '#FAF9F6',
        },
        text: {
          DEFAULT: '#0D1B1E', // Dark Navy
          muted: '#6B7280',
          light: '#FFFFFF',
        },
        border: {
          DEFAULT: '#DCD9CE',
          active: '#0E5A3A',
        },
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
    },
  },
  plugins: [],
};
