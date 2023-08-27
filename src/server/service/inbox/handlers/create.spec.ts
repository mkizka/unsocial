import type { Note } from "@prisma/client";

import { mockedLogger } from "@/mocks/logger";
import { mockedPrisma } from "@/mocks/prisma";

import { handle } from "./create";

const dummyRemoteUser = {
  id: "dummyidremote",
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
      },
    };
    mockedPrisma.note.create.mockResolvedValueOnce({} as Note);
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(mockedPrisma.note.create).toHaveBeenCalledWith({
      data: {
        url: activity.object.id,
        userId: dummyRemoteUser.id,
        content: activity.object.content,
        publishedAt: activity.object.published,
      },
    });
    expect(error).toBeUndefined();
  });
  test("すでにurlが存在する場合はスキップする", async () => {
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
      },
    };
    mockedPrisma.note.create.mockRejectedValueOnce({
      code: "P2002",
    });
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      "すでに存在するノートを受信したのでスキップします",
    );
    expect(mockedPrisma.note.create).toHaveBeenCalledWith({
      data: {
        url: activity.object.id,
        userId: dummyRemoteUser.id,
        content: activity.object.content,
        publishedAt: activity.object.published,
      },
    });
    expect(error).toBeUndefined();
  });
});
