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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50:  '#FDF6EC',
          100: '#F5E5CC',
          200: '#E8C99A',
          300: '#D8A870',
          400: '#C8946A',
          500: '#B07850',
          600: '#A06040',
          700: '#7B4A1E',
          800: '#5A3214',
          900: '#3D1F0A',
        },
      },
    },
  },
  plugins: [],
};
export default config;
