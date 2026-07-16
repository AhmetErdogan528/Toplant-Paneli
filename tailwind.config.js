/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
  colors: {
    arel: {
      navy: "#121E2D",
      navyLight: "#1B2C42",
      blue: "#00529B",
      blueDark: "#003F78",
      gold: "#AB8E58",
      goldDark: "#8F7548",
      green: "#1F8A3B",
      greenBg: "#E6F4EA",
      amber: "#8A6A34",
      amberBg: "#F5EEE2",
      red: "#B4463A",
      redBg: "#FBEAE8",
    },
  },
},
  },
  plugins: [],
}