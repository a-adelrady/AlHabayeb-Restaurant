/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    // FIX: Override ALL screens when using `screens` inside `extend`.
    // The original config had `sm: 375px` which OVERRIDES Tailwind's default
    // sm (640px), breaking all `sm:` breakpoint utilities site-wide.
    // Using extend.screens ensures we only ADD xs without clobbering defaults.
    extend: {
      screens: {
        'xs': '375px',
        // sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px) — default Tailwind
      },
      colors: {
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#C8960C',
          600: '#B8860B',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        dark: {
          50:  '#1a1a1a',
          100: '#141414',
          200: '#0f0f0f',
          300: '#0a0a0a',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Noto Naskh Arabic', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200, 150, 12, 0.4)' },
          '50%':      { boxShadow: '0 0 0 10px rgba(200, 150, 12, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C8960C 0%, #fcd34d 50%, #C8960C 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
      },
    },
  },
  plugins: [],
}
