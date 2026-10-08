/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#FAF9F7",
          100: "#F5F3EF",
          200: "#EAE6DF",
          300: "#D8D2C7",
          400: "#BFB8AB",
          500: "#A39988",
          600: "#857A68",
          700: "#6B6253",
          800: "#4A453B",
          900: "#2D2A24",
        },
        ink: {
          50: "#E8E7E4",
          100: "#C9C8C3",
          200: "#A5A39D",
          300: "#7F7D75",
          400: "#5A584F",
          500: "#3D3B34",
          600: "#2A2823",
          700: "#1F1E1A",
          800: "#1A1A18",
          900: "#0F0F0D",
        },
        clay: {
          50: "#f2f7f1",
          100: "#e0efe0",
          200: "#c2e0c1",
          300: "#96ca95",
          400: "#63ac62",
          500: "#31682c",
          600: "#2a5925",
          700: "#234920",
          800: "#1d3c1a",
          900: "#183216",
        },
        sage: {
          50: "#F0F4ED",
          100: "#DCE5D2",
          200: "#B5C9A4",
          300: "#8DA776",
          400: "#6B854F",
          500: "#526938",
          600: "#3D5028",
          700: "#2A3819",
          800: "#1A2410",
          900: "#0C1208",
        },
      },
      fontFamily: {
        serif: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        "ultra-wide": "0.05em",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
