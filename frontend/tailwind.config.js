/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  extend: {
    colors: {
      customHoverColor: "#495867", // カスタムホバーカラー
    },
  },
  plugins: [],
};
