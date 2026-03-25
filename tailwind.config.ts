import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "royal-blue": {
          DEFAULT: "#0024cc", // Deep Royal Blue
          dark: "#001a99",
          light: "#3352ff",
        },
        "neon-green": {
          DEFAULT: "#39ff14", // Neon Green
          glow: "#a2ff00", // Electric lime
        },
        "glass": "rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        "main-gradient": "linear-gradient(135deg, #001f3f 0%, #0024cc 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        accent: ["Poppins", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        "neon": "0 0 20px rgba(57, 255, 20, 0.4)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
export default config;
