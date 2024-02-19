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
    relayServers: [
      {
        inboxUrl: "https://relay.example.com/inbox",
        status: "ACCEPTED",
      },
      {
        inboxUrl: "https://relay2.example.com/inbox",
        status: "SENT",
      },
      {
        inboxUrl: "https://relay3.example.com/inbox",
        status: "FAILED",
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof RelayServerForm>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    relayServers: [],
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
