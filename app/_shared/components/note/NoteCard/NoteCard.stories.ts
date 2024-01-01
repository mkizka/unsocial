import type { Meta, StoryObj } from "@storybook/react";

import { NoteCard } from "./NoteCard";

const meta: Meta<typeof NoteCard> = {
  component: NoteCard,
  args: {
    // TODO
  },
};

export default meta;

type Story = StoryObj<typeof NoteCard>;

// export const Default: Story = {};
