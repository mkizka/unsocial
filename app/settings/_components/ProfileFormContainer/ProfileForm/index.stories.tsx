import type { Meta, StoryObj } from "@storybook/react";

import { ProfileForm } from ".";

const meta: Meta<typeof ProfileForm> = {
  component: ProfileForm,
  args: {
    user: {
      name: "現在のname",
      summary: "現在のsummary",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProfileForm>;

export const Default: Story = {};
