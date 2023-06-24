import type { Session } from "next-auth";

import { mockedPrisma } from "@/mocks/prisma";
import { getServerSession } from "@/utils/getServerSession";
import { relayActivityToInboxUrl } from "@/utils/relayActivity";

import { action } from "./action";

jest.mock("@/utils/relayActivity");
const mockedRelayActivityToInboxUrl = jest.mocked(relayActivityToInboxUrl);

jest.mock("@/utils/getServerSession");
const mockedGetServerSession = jest.mocked(getServerSession);

const dummyLocalUser = {
  id: "dummy_local",
};

describe("LikeButton/action", () => {
  test("ローカルユーザーのNote", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({
      user: dummyLocalUser,
    } as Session);
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
    mockedGetServerSession.mockResolvedValue({
      user: dummyLocalUser,
    } as Session);
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
      inboxUrl: new URL("https://remote.example.com/inbox"),
      sender: dummyLocalUser,
      activity: expect.objectContaining({
        type: "Like",
      }),
    });
  });

  test("ローカルユーザーのNote(いいね済みの場合)", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({
      user: dummyLocalUser,
    } as Session);
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
    mockedGetServerSession.mockResolvedValue({
      user: dummyLocalUser,
    } as Session);
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
      inboxUrl: new URL("https://remote.example.com/inbox"),
      sender: dummyLocalUser,
      activity: expect.objectContaining({ type: "Undo" }),
    });
  });
});
