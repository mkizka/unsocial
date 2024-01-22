import "@/globals.css";

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
