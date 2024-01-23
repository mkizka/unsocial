import type { Meta, StoryObj } from "@storybook/react";

import { Spinner } from ".";

const meta: Meta<typeof Spinner> = {
  component: Spinner,
  args: {
    className: "w-8 h-8 text-secondary",
  },
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};
