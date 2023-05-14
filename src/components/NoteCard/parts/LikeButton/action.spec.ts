import type { Session } from "next-auth";

import { queue } from "@/server/background/queue";
import { getServerSession } from "@/utils/getServerSession";
import { mockedPrisma } from "@/utils/mock";

import { action } from "./action";

jest.mock("@/server/background/queue");
const mockedQueue = jest.mocked(queue);

jest.mock("@/utils/getServerSession");
const mockedGetServerSession = jest.mocked(getServerSession);

const dummyLocalUser = {
  id: "dummy_local",
  privateKey: "privateKey",
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
            "select": {
              "url": true,
              "user": {
                "select": {
                  "host": true,
                },
              },
            },
          },
        },
      }
    `);
    expect(mockedQueue.push).not.toHaveBeenCalled();
  });

  test("リモートユーザーのNote", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({
      user: dummyLocalUser,
    } as Session);
    mockedPrisma.like.create.mockResolvedValue({
      id: "likeId",
      userId: dummyLocalUser.id,
      note: {
        // @ts-ignore
        url: "https://remote.example.com/n/note_remote",
        user: {
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
            "select": {
              "url": true,
              "user": {
                "select": {
                  "host": true,
                },
              },
            },
          },
        },
      }
    `);
    expect(mockedQueue.push).toHaveBeenCalledWith({
      runner: "relayActivity",
      params: {
        sender: dummyLocalUser,
        activity: expect.objectContaining({
          type: "Like",
        }),
      },
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
    expect(mockedQueue.push).not.toHaveBeenCalled();
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
    expect(mockedQueue.push).toHaveBeenCalledWith({
      params: {
        sender: dummyLocalUser,
        activity: expect.objectContaining({ type: "Undo" }),
      },
      runner: "relayActivity",
    });
  });
});
