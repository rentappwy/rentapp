import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#13161D", soft: "#3B414E", muted: "#737884" },
        paper: "#F7F8FA",
        accent: { DEFAULT: "#4F46E5", dark: "#4338CA", tint: "#EEF0FE" },
        line: "#E6E8EE",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,19,15,0.04), 0 18px 40px -16px rgba(20,19,15,0.14)",
        soft: "0 1px 3px rgba(20,19,15,0.07)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
