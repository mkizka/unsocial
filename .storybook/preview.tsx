/* eslint-disable @dword-design/import-alias/prefer-alias */
// knip@5.2.3~ がパスエイリアスを解決できないため無視する
import "../app/globals.css";

import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    actions: {
      argTypesRegex: "^on[A-Z].*",
    },
  },
};

export default preview;
