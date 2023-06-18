// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        primary: colors.gray["300"], // 背景などサイト全体の色
        "primary-dark": colors.gray["400"],
        "primary-light": colors.gray["100"],
        secondary: colors.cyan["500"], // ボタンなどの色
        "secondary-dark": colors.cyan["600"],
        "secondary-light": colors.cyan["400"],
        accent: colors.rose["500"], // その他色を使いたいところ
        "accent-dark": colors.rose["600"],
        "accent-light": colors.rose["400"],
        dark: colors.gray["700"], // 背景が明るい文字
        gray: colors.gray["400"],
        light: colors.gray["100"], // 背景が暗い文字
      },
    },
  },
  plugins: [],
};
