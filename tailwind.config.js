/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs',
    './public/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        pinkCustom: "#DB2878",
        lightPink: "#FFF1F5" // optional for the div bg
      },
      boxShadow: {
        "glow-pink": "0 0 10px #DB2878",
      }
    },
  },
  plugins: [],
}

