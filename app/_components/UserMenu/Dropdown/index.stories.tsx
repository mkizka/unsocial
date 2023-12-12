import { expect } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";
import type { ComponentProps } from "react";

import { Card } from "@/_shared/components/ui/Card";

import { Dropdown } from ".";

function Component(args: ComponentProps<typeof Dropdown>) {
  return (
    <Card className="flex w-64 justify-end">
      <Dropdown {...args} />
    </Card>
  );
}
const meta: Meta<typeof Dropdown> = {
  component: Component,
  args: {
    iconUrl: "https://via.placeholder.com/36x36",
    iconAlt: "アイコン",
  },
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("user-menu__button"));
    expect(canvas.queryByTestId("user-menu__dropdown")).toBeInTheDocument();
    await userEvent.click(canvas.getByTestId("user-menu__backdrop"));
    expect(canvas.queryByTestId("user-menu__dropdown")).not.toBeInTheDocument();
  },
};
