/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#233044',
        muted: '#8fa1b6',
        line: '#d9e5ef',
        primary: '#16a34a',
        primaryDark: '#15803d',
        leaf: '#2e7d32',
        clay: '#8d6e63',
        paper: '#f8fbfd'
      },
      boxShadow: {
        phone: '0 30px 80px rgba(31, 45, 64, 0.22)',
        card: '0 12px 30px rgba(42, 66, 92, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
