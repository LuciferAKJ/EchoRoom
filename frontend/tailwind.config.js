/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        echo: {
          bg: "#0d0f14",        // Deep charcoal / midnight
          surface: "#161922",   // Subtle dark grey primary surface
          card: "#1b1f2b",      // Elevated cards
          hover: "#232838",     // Subtle card hover
          border: "#262b3c",    // Clean restrained borders
          text: "#f1f3f9",      // Warm off-white main text
          muted: "#949cb3",     // Secondary muted grey
          subtle: "#5f667d",    // Subtle labels and placeholders
          lavender: "#b4a0e5",  // Restrained lavender accent
          lavenderDark: "#8772be",
          lavenderLight: "#e5def7",
          coral: "#e28678",     // Muted warm coral
          periwinkle: "#8ea4d2",// Soft periwinkle
          emerald: "#4eab8b",   // Calm green for support / positive states
          amber: "#e0a05a",     // Warm amber for caution / reflection
          rose: "#dc6b7f",      // Soft muted rose
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(0, 0, 0, 0.4), 0 1px 4px -1px rgba(0, 0, 0, 0.3)',
        'elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
