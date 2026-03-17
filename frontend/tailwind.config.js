/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          // Background layers
          bg: "#1e1f22",
          "bg-secondary": "#2b2d31",
          "bg-tertiary": "#313338",
          "bg-hover": "#35373c",
          // Brand
          blurple: "#5865f2",
          "blurple-dark": "#4752c4",
          green: "#23a55a",
          red: "#f23f43",
          yellow: "#f0b232",
          // Text
          "text-primary": "#f2f3f5",
          "text-secondary": "#b5bac1",
          "text-muted": "#80848e",
          // Input
          "input-bg": "#1e1f22",
          "input-border": "#1e1f22",
          // Misc
          separator: "#3f4147",
        },
      },
      fontFamily: {
        sans: ['"gg sans"', '"Noto Sans"', '"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        mono: ['"Consolas"', '"Andale Mono WT"', '"Andale Mono"', '"Lucida Console"', "Courier", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: "translateY(8px)", opacity: 0 }, to: { transform: "translateY(0)", opacity: 1 } },
        pulseDot: { "0%, 80%, 100%": { transform: "scale(0)" }, "40%": { transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
};
