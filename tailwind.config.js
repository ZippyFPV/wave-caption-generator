// TAILWIND CSS CONFIGURATION FILE
// This file configures Tailwind CSS, a utility-first CSS framework
// Tailwind generates CSS classes based on your configuration and usage

/** @type {import('tailwindcss').Config} */
// TypeScript comment for better IntelliSense support in VS Code
export default {
  // CONTENT PATHS - Tell Tailwind where to look for class usage
  // Tailwind scans these files to determine which CSS classes to generate
  // This "purging" keeps the final CSS bundle small by only including used classes
  content: [
    "./index.html", // Scan the main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all JavaScript/TypeScript/JSX/TSX files in src folder
  ],
  
  // THEME CONFIGURATION - Customize Tailwind's design system
  theme: {
    // EXTEND - Add custom values without overriding Tailwind's defaults
    extend: {
      // Example customizations you might add:
      // colors: { brand: '#1e40af' } - Add custom colors
      // fontFamily: { sans: ['Inter', 'sans-serif'] } - Custom fonts
      // spacing: { '72': '18rem' } - Custom spacing values
      // breakpoints: { 'xs': '475px' } - Custom responsive breakpoints
    },
  },
  
  // PLUGINS ARRAY - Add Tailwind plugins for additional functionality
  plugins: [
    // Example plugins you might use:
    // require('@tailwindcss/forms') - Better form styling
    // require('@tailwindcss/typography') - Typography styles for prose
    // require('@tailwindcss/aspect-ratio') - Aspect ratio utilities
  ],
}