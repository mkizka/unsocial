import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";

import { IconFileInput } from ".";
import icon from "./__fixtures__/icon.webp";
const meta: Meta<typeof IconFileInput> = {
  component: IconFileInput,
  args: {
    userId: "foo",
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/users/foo/icon.webp?size=100", async (request) => {
          const file = await fetch(icon.src).then((res) => res.arrayBuffer());
          return HttpResponse.arrayBuffer(file, {
            headers: {
              "Content-Type": "image/webp",
            },
          });
        }),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconFileInput>;

export const Default: Story = {};
