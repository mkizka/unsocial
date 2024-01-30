import type { Note, User } from "@prisma/client";

import { mockedPrisma } from "@/_shared/mocks/prisma";

import { handle } from "./create";

const mockedNow = new Date("2023-01-01T00:00:00.000Z");
jest.useFakeTimers();
jest.setSystemTime(mockedNow);

const dummyRemoteUser = {
  id: "remote_user",
  lastFetchedAt: mockedNow,
};

describe("inboxCreateService", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Create",
      actor: "https://remote.example.com/u/remote_user",
      object: {
        id: "https://remote.example.com/n/12345",
        type: "Note",
        attributedTo: "https://remote.example.com/u/remote_user",
        content: "<p>text</p>",
        published: "2023-01-01T00:00:00.000Z",
        to: ["https://www.w3.org/ns/activitystreams#Public"],
        cc: ["https://remote.example.com/u/remote_user/followers"],
        attributeTo: "https://remote.example.com/u/remote_user",
        attachment: [
          {
            type: "Document",
            mediaType: "image/png",
            url: "https://remote.example.com/image.png",
          },
        ],
      },
    } as const;
    mockedPrisma.note.create.mockResolvedValueOnce({} as Note);
    mockedPrisma.user.findUnique.mockResolvedValueOnce(dummyRemoteUser as User);
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(error).toBeUndefined();
  });
});
