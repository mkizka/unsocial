import path from "path";

// https://nextjs.org/docs/basic-features/eslint#linting-custom-directories-and-files
const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

export default {
  "*.{js,mjs,ts,mts,tsx}": [buildEslintCommand],
  "*": "prettier --ignore-unknown --write",
};
