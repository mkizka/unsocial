import { expect, jest } from "@storybook/jest";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/testing-library";

import { SearchModal } from ".";

const meta: Meta<typeof SearchModal> = {
  component: SearchModal,
};

export default meta;

type Story = StoryObj<typeof SearchModal>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("search-modal__button"));
    await userEvent.type(canvas.getByTestId("search-modal__input"), "@foo");
    await userEvent.click(canvas.getByTestId("search-modal__submit"));
    expect(canvas.queryByTestId("search-modal__input")).toBeNull();
  },
};

export const InvalidInput: Story = {
  play: async ({ canvasElement }) => {
    const spyAlert = jest.spyOn(window, "alert").mockImplementation(() => {});
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("search-modal__button"));
    await userEvent.type(canvas.getByTestId("search-modal__input"), "foo");
    await userEvent.click(canvas.getByTestId("search-modal__submit"));
    expect(spyAlert).toHaveBeenCalledWith("@から始まる必要があります");
  },
};
