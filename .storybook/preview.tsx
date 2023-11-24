import "@/app/globals.css";

import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";

initialize();

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
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
  loaders: [mswLoader],
};

export default preview;
