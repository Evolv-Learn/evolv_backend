/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.{css,scss}', // so Tailwind sees globals.css
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          gold: '#D4AF37',
          'gold-light': '#E8D090',
          'gold-dark': '#B8941F',
        },
        secondary: {
          blue: '#1E3A8A',
          'blue-light': '#3B5BA5',
          'blue-dark': '#0F1F4A',
        },
        accent: {
          terracotta: '#C1440E',
        },
        success: {
          DEFAULT: '#228B22',
        },

        // African-inspired named colors used across the site
        'igbo-red': '#C1440E',
        'hausa-indigo': '#2D1B69',

        // extra flat colors to match your globals.css usage
        'warm-white': '#FFF8F0',
        'earth-gray': '#8B7355',
        'deep-black': '#1A1A1A',

        // this defines the `border-border` utility
        border: '#E5E7EB',
      },
      fontFamily: {
        // Open Sans for body text
        sans: ['var(--font-sans)', 'system-ui', 'ui-sans-serif', 'sans-serif'],
        // Poppins for headings — wired from layout.tsx via CSS variable
        heading: ['var(--font-heading)', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
