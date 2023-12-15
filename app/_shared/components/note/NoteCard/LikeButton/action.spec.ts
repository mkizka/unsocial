import { mockedPrisma } from "@/_mocks/prisma";
import { mockedGetSessionUserId } from "@/_mocks/session";
import { relayActivityToInboxUrl } from "@/_shared/utils/relayActivity";

import { action } from "./action";

jest.mock("@/_shared/utils/relayActivity");
const mockedRelayActivityToInboxUrl = jest.mocked(relayActivityToInboxUrl);

const dummyLocalUserId = "dummy_local";

describe("LikeButton/action", () => {
  test("ローカルユーザーのNote", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummyLocalUserId);
    mockedPrisma.like.create.mockResolvedValue({
      note: {
        // @ts-ignore
        user: {
          host: "myhost.example.com",
        },
      },
    });
    // act
    await action({
      noteId: "noteId",
      content: "👍",
    });
    // assert
    expect(mockedPrisma.like.create.mock.lastCall?.[0]).toMatchInlineSnapshot(`
      {
        "data": {
          "content": "👍",
          "noteId": "noteId",
          "userId": "dummy_local",
        },
        "include": {
          "note": {
            "include": {
              "user": true,
            },
          },
        },
      }
    `);
    expect(mockedRelayActivityToInboxUrl).not.toHaveBeenCalled();
  });

  test("リモートユーザーのNote", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummyLocalUserId);
    mockedPrisma.like.create.mockResolvedValue({
      id: "likeId",
      note: {
        // @ts-ignore
        url: "https://remote.example.com/n/note_remote",
        user: {
          inboxUrl: "https://remote.example.com/inbox",
          host: "remote.example.com",
        },
      },
    });
    // act
    await action({
      noteId: "noteId",
      content: "👍",
    });
    // assert
    expect(mockedPrisma.like.create.mock.lastCall?.[0]).toMatchInlineSnapshot(`
      {
        "data": {
          "content": "👍",
          "noteId": "noteId",
          "userId": "dummy_local",
        },
        "include": {
          "note": {
            "include": {
              "user": true,
            },
          },
        },
      }
    `);
    expect(mockedRelayActivityToInboxUrl).toHaveBeenCalledWith({
      userId: dummyLocalUserId,
      inboxUrl: new URL("https://remote.example.com/inbox"),
      activity: expect.objectContaining({
        type: "Like",
      }),
    });
  });

  test("ローカルユーザーのNote(いいね済みの場合)", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummyLocalUserId);
    const dummyLike = {
      id: "likeId",
      noteId: "noteId",
      note: {
        user: {
          host: "myhost.example.com",
        },
      },
      userId: "dummy_local",
      content: "👍",
      createdAt: new Date(),
    };
    mockedPrisma.like.findFirst.mockResolvedValue(dummyLike);
    // act
    await action({
      noteId: "noteId",
      content: "👍",
    });
    // assert
    expect(mockedPrisma.like.delete).toHaveBeenCalledWith({
      where: {
        id: dummyLike.id,
      },
    });
    expect(mockedRelayActivityToInboxUrl).not.toHaveBeenCalled();
  });

  test("リモートユーザーのNote(いいね済みの場合)", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummyLocalUserId);
    const dummyLike = {
      id: "likeId",
      noteId: "noteId",
      note: {
        url: "https://remote.example.com/n/note_remote",
        user: {
          inboxUrl: "https://remote.example.com/inbox",
          host: "remote.example.com",
        },
      },
      userId: "dummy_local",
      content: "👍",
      createdAt: new Date(),
    };
    mockedPrisma.like.findFirst.mockResolvedValue(dummyLike);
    // act
    await action({
      noteId: "noteId",
      content: "👍",
    });
    // assert
    expect(mockedPrisma.like.delete).toHaveBeenCalledWith({
      where: { id: "likeId" },
    });
    expect(mockedRelayActivityToInboxUrl).toHaveBeenCalledWith({
      userId: dummyLocalUserId,
      inboxUrl: new URL("https://remote.example.com/inbox"),
      activity: expect.objectContaining({ type: "Undo" }),
    });
  });
});
