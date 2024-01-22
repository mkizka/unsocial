import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from ".";

const meta: Meta<typeof Textarea> = {
  component: Textarea,
  args: {
    placeholder: "Textarea",
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
