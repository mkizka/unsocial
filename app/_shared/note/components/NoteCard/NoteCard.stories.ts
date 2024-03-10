import type { Meta, StoryObj } from "@storybook/react";

import type { noteCardFindService } from "@/_shared/note/services/noteCardFindService";

import { NoteCard } from "./NoteCard";

const note: noteCardFindService.NoteCard = {
  id: "1",
  publishedAt: new Date("2024-01-01T00:00:00.000Z"),
  content: "投稿内容",
  attachmentUrls: [],
  url: "/notes/1",
  isLiked: false,
  isMine: false,
  // @ts-expect-error
  user: {
    url: "/user",
    name: "ユーザー名",
    displayUsername: "@preferredUsername@example.com",
    iconHash: "default",
  },
};

const meta: Meta<typeof NoteCard> = {
  component: NoteCard,
  args: {
    note,
  },
};

export default meta;

type Story = StoryObj<typeof NoteCard>;

export const Default: Story = {};

export const Repost: Story = {
  args: {
    note: {
      ...note,
      quotedBy: note.user,
    },
  },
};
