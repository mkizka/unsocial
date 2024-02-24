import type { Meta, StoryObj } from "@storybook/react";

import { Card } from "@/_shared/ui/Card";

import { RelayServerForm } from ".";

const meta: Meta<typeof RelayServerForm> = {
  component: RelayServerForm,
  decorators: [
    (Story) => (
      <Card>
        <Story />
      </Card>
    ),
  ],
  args: {
    formAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        type: "success",
        message: "成功メッセージ",
      };
    },
  },
};

export default meta;

type Story = StoryObj<typeof RelayServerForm>;

export const Default: Story = {};

export const Error: Story = {
  args: {
    formAction: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        type: "error",
        message: "エラーメッセージ",
      };
    },
  },
};
