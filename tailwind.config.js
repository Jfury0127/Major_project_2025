/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs',
    './public/**/*.js'
  ],
  safelist: [
    {
      pattern: /bg-\[url\(.*\)\]/,
    },
  ],
  theme: {
    extend: {
      colors: {
        pinkCustom: "#DB2878",
        lightPink: "#FFF1F5" // optional for the div bg
      },
      boxShadow: {
        "glow-pink": "0 0 10px #DB2878",
        'pink-glow': '0 0 8px rgb(228, 148, 184)',
      }
    },
  },
  plugins: [],
}

