/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        akatsuki: {
          red: '#8B0000',
          dark: '#1a0000',
        }
      },
      maxWidth: {
        container: "1280px",
      },
      animation: {
        marquee: 'marquee var(--duration) linear infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' }
        }
      }
    },
  },
  plugins: [],
}
