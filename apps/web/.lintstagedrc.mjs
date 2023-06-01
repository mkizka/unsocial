import path from "path";

const dirname = path.dirname(new URL(import.meta.url).pathname);

// https://nextjs.org/docs/basic-features/eslint#linting-custom-directories-and-files
const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    // lint-stagedから呼ばれるこのコマンドは apps/web をカレントディレクトリとして実行されるため、
    // dirname を元に apps/web からの相対パスで指定する
    .map((f) => path.relative(dirname, f))
    .join(" --file ")}`;

export default {
  "*.{js,mjs,ts,tsx}": [buildEslintCommand],
  "*": "prettier --ignore-unknown --write",
};
