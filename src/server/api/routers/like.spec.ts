import type { User } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";
import { prismaMock } from "../../../__mocks__/db";
import { queue } from "../../background/queue";
import { appRouter } from "../root";

jest.mock("../../background/queue");
const mockedQueue = jest.mocked(queue);

const dummyRemoteUser = {
  id: "dummy_remote",
  name: "Dummy",
  preferredUsername: "dummy",
  host: "remote.example.com",
  email: null,
  emailVerified: null,
  image: null,
  icon: null,
  publicKey: null,
  privateKey: "privateKey",
  actorUrl: "https://remote.example.com/users/dummy_remote",
  inboxUrl: null,
} satisfies User;

type TRPCContext = Parameters<typeof appRouter.createCaller>[0];

const dummyLocalUser = {
  id: "dummy_local",
  privateKey: "privateKey",
};

describe("like", () => {
  test("ローカルユーザー", async () => {
    // arrange
    const ctx = mockDeep<TRPCContext>();
    ctx.session = {
      user: dummyLocalUser,
      expires: "",
    };
    // @ts-ignore
    prismaMock.user.findFirst.mockResolvedValue(dummyLocalUser);
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
    await caller.like.create("noteId");
    // assert
    expect(prismaMock.like.create).toHaveBeenCalledWith({
      data: {
        noteId: "noteId",
        userId: "dummy_local",
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

  test("リモートユーザー", async () => {
    // arrange
    const ctx = mockDeep<TRPCContext>();
    ctx.session = {
      user: dummyLocalUser,
      expires: "",
    };
    prismaMock.user.findFirst.mockResolvedValue(dummyRemoteUser);
    prismaMock.like.create.mockResolvedValue({
      note: {
        // @ts-ignore
        url: "https://remote.example.com/n/12345",
        user: {
          host: "remote.example.com",
        },
      },
    });
    // act
    const caller = appRouter.createCaller(ctx);
    await caller.like.create("noteId");
    // assert
    expect(prismaMock.like.create).toHaveBeenCalledWith({
      data: {
        noteId: "noteId",
        userId: "dummy_local",
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
        activity: {
          "@context": [
            new URL("https://www.w3.org/ns/activitystreams"),
            new URL("https://w3id.org/security/v1"),
          ],
          actor: new URL("https://myhost.example.com/users/undefined"),
          content: "👍",
          id: new URL("https://myhost.example.com/likes/undefined"),
          object: new URL("https://remote.example.com/n/12345"),
          type: "Like",
        },
        privateKey: "privateKey",
        publicKeyId: "https://myhost.example.com/users/dummy_local#main-key",
      },
      runner: "relayActivity",
    });
  });
});
