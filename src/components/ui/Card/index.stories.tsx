import type { Meta, StoryObj } from "@storybook/react";

import { Card } from ".";

const meta: Meta<typeof Card> = {
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    className: "h-20 w-40",
  },
};
