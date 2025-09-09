import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  content: [],
  theme: {
    extend: {
      boxShadow: {
        primary: "2px 4px 4px 4px rgba(28, 35, 33, 0.15)",
        secondary: "2px 4px 4px 4px rgba(238, 241, 239, 0.15)",
        additional: "2px 4px 4px 4px rgba(255, 64, 0, 0.15)",
      },
    },
    colors: {
      primary: {
        50: "#F2F5F4",
        100: "#E3E8E7",
        200: "#BFC9C8",
        300: "#9BA8A6",
        400: "#586663",
        500: "#1C2321",
        600: "#18211E",
        700: "#0F1A16",
        800: "#0A1410",
        900: "#060F0B",
        950: "#020A06",
      },
      secondary: {
        200: "#FCFCFC",
        300: "#FAFAFA",
        400: "#F5F7F6",
        500: "#EEF1EF",
        600: "#C3DBCB",
        700: "#86B594",
        800: "#569166",
        900: "#316E40",
        950: "#154720",
      },
      additional: {
        50: "#FFFAF2",
        100: "#FFF4E6",
        200: "#FFE1BF",
        300: "#FFCA99",
        400: "#FF8E4D",
        500: "#FF4000",
        600: "#E63600",
        700: "#BF2900",
        800: "#991F00",
        900: "#731500",
        950: "#4A0C00",
      },
    },
    fontFamily: {
      default: ["Poppins", "sans-serif"],
      accentOne: ["Noto Sans", "sans-serif"],
      accentTwo: ["Courier Prime", "monospace"],
      accentThree: ["Pacifico", "cursive"],
    },
  },
  plugins: [],
};
