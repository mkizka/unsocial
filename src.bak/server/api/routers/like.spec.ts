import { mockDeep } from "jest-mock-extended";

import { prismaMock } from "../../../__mocks__/db";
import { queue } from "../../background/queue";
import { appRouter } from "../root";

jest.mock("../../background/queue");
const mockedQueue = jest.mocked(queue);

type TRPCContext = Parameters<typeof appRouter.createCaller>[0];

const dummyLocalUser = {
  id: "dummy_local",
  privateKey: "privateKey",
};

describe("like", () => {
  describe("create", () => {
    test("ローカルユーザーのNote", async () => {
      // arrange
      const ctx = mockDeep<TRPCContext>();
      ctx.session = {
        user: dummyLocalUser,
        expires: "",
      };
      prismaMock.like.create.mockResolvedValue({
        note: {
          // @ts-ignore
          user: {
            host: "myhost.example.com",
          },
        },
      });
      // act
      const caller = appRouter.createCaller(ctx);
      await caller.like.create({
        noteId: "noteId",
        content: "👍",
      });
      // assert
      expect(prismaMock.like.create).toHaveBeenCalledWith({
        data: {
          noteId: "noteId",
          userId: "dummy_local",
          content: "👍",
        },
        include: {
          note: {
            select: {
              user: {
                select: {
                  host: true,
                },
              },
              url: true,
            },
          },
        },
      });
      expect(mockedQueue.push).not.toHaveBeenCalled();
    });

    test("リモートユーザーのNote", async () => {
      // arrange
      const ctx = mockDeep<TRPCContext>();
      ctx.session = {
        user: dummyLocalUser,
        expires: "",
      };
      prismaMock.like.create.mockResolvedValue({
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
      const caller = appRouter.createCaller(ctx);
      await caller.like.create({
        noteId: "noteId",
        content: "👍",
      });
      // assert
      expect(prismaMock.like.create).toHaveBeenCalledWith({
        data: {
          noteId: "noteId",
          userId: "dummy_local",
          content: "👍",
        },
        include: {
          note: {
            select: {
              user: {
                select: {
                  host: true,
                },
              },
              url: true,
            },
          },
        },
      });
      expect(mockedQueue.push).toHaveBeenCalledWith({
        params: {
          sender: dummyLocalUser,
          activity: {
            "@context": [
              new URL("https://www.w3.org/ns/activitystreams"),
              new URL("https://w3id.org/security/v1"),
            ],
            actor: new URL("https://myhost.example.com/users/dummy_local"),
            content: "👍",
            id: new URL("https://myhost.example.com/likes/likeId"),
            object: new URL("https://remote.example.com/n/note_remote"),
            type: "Like",
          },
        },
        runner: "relayActivity",
      });
    });

    test("ローカルユーザーのNote(いいね済みの場合)", async () => {
      // arrange
      const ctx = mockDeep<TRPCContext>();
      ctx.session = {
        user: dummyLocalUser,
        expires: "",
      };
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
      prismaMock.like.findFirst.mockResolvedValue(dummyLike);
      // act
      const caller = appRouter.createCaller(ctx);
      await caller.like.create({
        noteId: "noteId",
        content: "👍",
      });
      // assert
      expect(prismaMock.like.delete).toHaveBeenCalledWith({
        where: {
          id: dummyLike.id,
        },
      });
      expect(mockedQueue.push).not.toHaveBeenCalled();
    });

    test("リモートユーザーのNote(いいね済みの場合)", async () => {
      // arrange
      const ctx = mockDeep<TRPCContext>();
      ctx.session = {
        user: dummyLocalUser,
        expires: "",
      };
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
      prismaMock.like.findFirst.mockResolvedValue(dummyLike);
      // act
      const caller = appRouter.createCaller(ctx);
      await caller.like.create({
        noteId: "noteId",
        content: "👍",
      });
      // assert
      expect(prismaMock.like.delete).toHaveBeenCalledWith({
        where: { id: "likeId" },
      });
      expect(mockedQueue.push).toHaveBeenCalledWith({
        params: {
          sender: dummyLocalUser,
          activity: {
            "@context": [
              new URL("https://www.w3.org/ns/activitystreams"),
              new URL("https://w3id.org/security/v1"),
            ],
            type: "Undo",
            // TODO: エンドポイントつくる
            id: new URL("https://myhost.example.com/likes/likeId?undo=true"),
            actor: new URL("https://myhost.example.com/users/dummy_local"),
            object: {
              actor: new URL("https://myhost.example.com/users/dummy_local"),
              content: "👍",
              id: new URL("https://myhost.example.com/likes/likeId"),
              object: new URL("https://remote.example.com/n/note_remote"),
              type: "Like",
            },
          },
        },
        runner: "relayActivity",
      });
    });
  });

  describe("details", () => {
    test("いいね詳細を表示するためのデータが呼ばれる", async () => {
      // arrange
      const ctx = mockDeep<TRPCContext>();
      ctx.session = {
        user: dummyLocalUser,
        expires: "",
      };
      // act
      const caller = appRouter.createCaller(ctx);
      await caller.like.details("noteId");
      // assert
      expect(prismaMock.like.findMany).toHaveBeenCalledWith({
        select: {
          content: true,
          user: {
            select: {
              id: true,
              name: true,
              preferredUsername: true,
              host: true,
            },
          },
        },
        where: { noteId: "noteId" },
      });
    });
  });
});
