import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/components"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: [path.resolve(__dirname, "../public")],
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
