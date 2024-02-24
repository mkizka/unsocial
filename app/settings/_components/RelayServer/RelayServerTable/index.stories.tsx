import type { RelayServer } from "@prisma/client";
import type { Meta, StoryObj } from "@storybook/react";

import { Card } from "@/_shared/ui/Card";

import { RelayServerTable } from ".";

const meta: Meta<typeof RelayServerTable> = {
  component: RelayServerTable,
  decorators: [
    (Story) => (
      <Card>
        <Story />
      </Card>
    ),
  ],
  args: {
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
    ] as RelayServer[],
  },
};

export default meta;

type Story = StoryObj<typeof RelayServerTable>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    relayServers: [],
  },
};
