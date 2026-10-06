import type { Config } from "tailwindcss";

/**
 * Mureeh Design Tokens
 * Premium · Elegant · Human · Technology-driven · Arabic-first
 * لا ألوان صاخبة، لا Neon، لا Generic SaaS.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm ivory surfaces
        ivory: {
          50: "#FFFDF9",
          100: "#FCFAF4",
          200: "#F7F4ED", // warm background
          300: "#F1ECE1",
          400: "#E6DFD0", // thin elegant borders
          500: "#D8CEB9",
        },
        // Champagne gold — primary
        gold: {
          DEFAULT: "#D4AF37",
          deep: "#C9A227",
          soft: "#E3CE86",
          tint: "#F7F1DE",
        },
        // Deep navy / charcoal
        navy: {
          DEFAULT: "#0B1320",
          800: "#101A2B",
          700: "#152238",
          600: "#1E3049",
          500: "#2C4568",
        },
        ink: {
          DEFAULT: "#171717",
          soft: "#3B3833",
          muted: "#5F5A50",
          faint: "#8A8478",
        },
        dark: "#15171A",
        line: "#E7E0D1",
      },
      fontFamily: {
        sans: ["var(--font-arabic)", "Segoe UI", "Tahoma", "system-ui", "sans-serif"],
        display: ["var(--font-arabic)", "Georgia", "serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.04em" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,19,32,0.04), 0 10px 30px -18px rgba(11,19,32,0.18)",
        card: "0 1px 1px rgba(11,19,32,0.03), 0 20px 50px -34px rgba(11,19,32,0.28)",
        elev: "0 30px 80px -44px rgba(11,19,32,0.42)",
        gold: "0 0 0 1px rgba(212,175,55,0.35), 0 12px 30px -18px rgba(201,162,39,0.45)",
      },
      maxWidth: {
        form: "960px",
        prose: "68ch",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "breath-sweep": {
          "0%": { transform: "translateX(-12%)", opacity: "0" },
          "40%": { opacity: "0.55" },
          "100%": { transform: "translateX(112%)", opacity: "0" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.65" },
        },
      },
      animation: {
        "breath-sweep": "breath-sweep 4.2s cubic-bezier(0.22,1,0.36,1) infinite",
        "soft-pulse": "soft-pulse 3.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
