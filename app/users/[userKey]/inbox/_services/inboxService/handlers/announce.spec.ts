import type { Note, User } from "@prisma/client";

import { mockedPrisma } from "@/_shared/mocks/prisma";

import { handle } from "./announce";

const dummyRemoteUser = {
  id: "dummy_remote",
} as User;

const dummyLocalUser = {
  id: "dummy_local",
  host: "myhost.example.com",
} as User;

describe("inboxAnnounceService", () => {
  test("ローカルのノートをリポストとして保存できる", async () => {
    // arrange
    const activity = {
      type: "Announce",
      id: "https://remote.example.com/u/dummy_remote_id/activities/1",
      actor: "https://remote.example.com/u/dummy_remote_id",
      object: "https://myhost.example.com/notes/foo/activity",
      published: "2024-01-01T00:00:00.000Z",
    };
    mockedPrisma.note.findUnique.mockResolvedValue({
      id: "foo",
    } as Note);
    mockedPrisma.user.findUnique.mockResolvedValue(dummyLocalUser);
    // act
    const error = await handle(activity, dummyRemoteUser);
    // assert
    expect(error).toBeUndefined();
    expect(mockedPrisma.note.findUnique).toHaveBeenCalled();
    expect(mockedPrisma.note.create).toHaveBeenCalledWith({
      data: {
        userId: "dummy_remote",
        content: "",
        quoteId: "foo",
        publishedAt: activity.published,
      },
    });
  });
});
