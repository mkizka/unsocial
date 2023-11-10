import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/components"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  // https://github.com/storybookjs/storybook/issues/3916#issuecomment-871283551
  webpackFinal(config) {
    config.resolve!.alias = {
      ...config.resolve!.alias,
      "@": path.resolve(__dirname, "../src"),
    };
    return config;
  },
};

export default config;
