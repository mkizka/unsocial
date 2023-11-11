import type { TestRunnerConfig } from "@storybook/test-runner";

// https://storybook.js.org/docs/react/writing-tests/snapshot-testing#set-up-test-runner
const config: TestRunnerConfig = {
  async postRender(page) {
    const elementHandler = await page.$("#storybook-root");
    const innerHTML = await elementHandler?.innerHTML();
    expect(innerHTML).toMatchSnapshot();
  },
};

export default config;
