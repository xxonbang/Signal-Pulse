/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        signal: {
          'strong-buy': '#059669',
          'buy': '#10b981',
          'neutral': '#d97706',
          'sell': '#ea580c',
          'strong-sell': '#dc2626',
        },
        accent: {
          primary: '#2563eb',
          'primary-light': '#3b82f6',
          secondary: '#0891b2',
        },
        bg: {
          primary: '#f8f9fa',
          secondary: '#ffffff',
          card: '#ffffff',
          'card-hover': '#f1f3f4',
          accent: '#e8f4fd',
        },
        text: {
          primary: '#1a1a2e',
          secondary: '#4a5568',
          muted: '#718096',
        },
        border: {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
