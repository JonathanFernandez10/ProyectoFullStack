/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}'
  ],
  theme: {
    extend: {
      colors: {
        // Paleta corporativa derivada del logo de Bodegas del Istmo:
        // navy (brand) + ámbar logístico (accent)
        brand: {
          50: '#f0f4f8',
          100: '#dce5ee',
          200: '#b9cbdd',
          300: '#8fabc6',
          400: '#5f84a8',
          500: '#3d618b',
          600: '#1e3a5f',
          700: '#17304f',
          800: '#11263f',
          900: '#0b1f33',
          950: '#06121f'
        },
        accent: {
          50: '#fef8ec',
          100: '#fdeecd',
          200: '#fbdb9a',
          300: '#f8c25c',
          400: '#f5a524',
          500: '#e8930c',
          600: '#c97407',
          700: '#a5590a',
          800: '#86490d',
          900: '#6e3c11'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Archivo', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
