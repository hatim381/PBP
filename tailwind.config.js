/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        tada: {
          '0%, 100%': { transform: 'scale(1) rotate(0)' },
          '10%, 20%': { transform: 'scale(0.9) rotate(-3deg)' },
          '30%, 50%, 70%, 90%': { transform: 'scale(1.1) rotate(3deg)' },
          '40%, 60%, 80%': { transform: 'scale(1.1) rotate(-3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        sparkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 }
        },
        crown: {
          '0%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
          '100%': { transform: 'rotate(-10deg)' }
        },
        poolEntry: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        shuffle: {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px) rotate(-5deg)' },
          '75%': { transform: 'translateX(10px) rotate(5deg)' },
          '100%': { transform: 'translateX(0)' }
        },
        poolAppear: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        diceRoll: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-15deg)' },
          '75%': { transform: 'rotate(15deg)' }
        },
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' }
        },
        poolSlideIn: {
          '0%': { 
            transform: 'translateY(50px) scale(0.9)',
            opacity: 0
          },
          '100%': { 
            transform: 'translateY(0) scale(1)',
            opacity: 1
          }
        },
        generate: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(180deg)' },
          '100%': { transform: 'scale(1) rotate(360deg)' }
        },
        popIn: {
          '0%': { transform: 'scale(0) translateY(20px)', opacity: '0' },
          '70%': { transform: 'scale(1.1) translateY(-5px)' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        tada: 'tada 1s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        shine: 'shine 8s ease infinite',
        pulse: 'pulse 2s ease-in-out infinite',
        sparkle: 'sparkle 2s ease-in-out infinite',
        crown: 'crown 3s ease-in-out infinite',
        poolEntry: 'poolEntry 0.5s ease-out forwards',
        shuffle: 'shuffle 0.5s ease-in-out',
        'pool-appear': 'poolAppear 0.6s ease-out forwards',
        'dice-roll': 'diceRoll 0.8s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out infinite',
        'poolSlideIn': 'poolSlideIn 0.5s ease-out forwards',
        'generate-pools': 'generate 1s ease-in-out',
        'pop-in': 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'fadeIn': 'fadeIn 0.5s ease-out forwards'
      },
      screens: {
        'print': {'raw': 'print'},
      },
      backgroundSize: {
        '200%': '200% auto',
        '300%': '300% auto',
      },
      transitionDuration: {
        '400': '400ms',
      },
      zIndex: {
        '100': '100',
      },
      height: {
        'screen-90': '90vh',
      },
      maxHeight: {
        'doc': '1123px', // A4 height
      },
      width: {
        'doc': '794px', // A4 width
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          100: '#fee2e2',
          500: '#ef4444',
          700: '#b91c1c',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        'gradient-summary': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      },
      boxShadow: {
        'colored': '0 4px 14px 0 rgba(14, 165, 233, 0.39)',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.print-exact': {
          '@media print': {
            size: 'A4',
            margin: '0',
            '-webkit-print-color-adjust': 'exact',
            'print-color-adjust': 'exact',
          }
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
};
