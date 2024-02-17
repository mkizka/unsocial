import type { Meta, StoryObj } from "@storybook/react";

import { RelayServerForm } from ".";

const meta: Meta<typeof RelayServerForm> = {
  component: RelayServerForm,
  args: {
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        type: "success",
        message: "成功メッセージ",
      };
    },
    relayServer: {
      inboxUrl: "https://example.com/inbox",
    },
  },
};

export default meta;

type Story = StoryObj<typeof RelayServerForm>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    relayServer: null,
  },
};

export const Error: Story = {
  args: {
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        type: "error",
        message: "エラーメッセージ",
      };
    },
  },
};
