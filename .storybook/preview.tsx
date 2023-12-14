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
    backgrounds: {
      default: "primary",
      values: [
        {
          name: "primary",
          value: "#d1d5db",
        },
      ],
    },
  },
};

export default preview;
