/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces"],
        sans: ["Manrope"],
      },
      colors: {
        ivory: {
          50: "#FBFAF7",
          100: "#F6F4EE",
          200: "#EDEAE0",
        },
        graphite: {
          900: "#0E1014",
          800: "#14171D",
          700: "#1B1F27",
          600: "#252A34",
          500: "#3A404C",
        },
        sage: {
          400: "#9BB39A",
          500: "#7E997D",
          600: "#637D62",
        },
        indigo_soft: {
          400: "#8B92C9",
          500: "#6E78B8",
          600: "#5862A0",
        },
      },
    },
  },
  plugins: [],
};
