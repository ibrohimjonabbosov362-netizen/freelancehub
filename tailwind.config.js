/** @type {import('tailwindcss').Config} */
const config = {
  // lib/ ham skanerlanadi: statuslar uchun klass nomlari o'sha yerda yozilgan
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
