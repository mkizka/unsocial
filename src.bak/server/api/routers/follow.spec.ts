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
  privateKey: null,
  actorUrl: "https://remote.example.com/users/dummy_remote",
  inboxUrl: null,
} satisfies User;

const dummyLocalUser = {
  id: "dummy_local",
  name: "Dummy",
  preferredUsername: "dummy",
  host: "myhost.example.com",
};

type TRPCContext = Parameters<typeof appRouter.createCaller>[0];

const dummySessionUser: NonNullable<TRPCContext["session"]>["user"] = {
  id: "dummy_session",
  privateKey: "privateKey",
};

describe("follow", () => {
  test("リモートユーザー", async () => {
    // arrange
    const ctx = mockDeep<TRPCContext>();
    ctx.session = {
      user: dummySessionUser,
      expires: "",
    };
    prismaMock.follow.create.mockResolvedValue({
      id: "followId",
      followeeId: dummyRemoteUser.id,
      followee: {
        host: dummyRemoteUser.host,
        actorUrl: dummyRemoteUser.actorUrl,
      },
      followerId: dummySessionUser.id,
      status: "SENT",
      createdAt: new Date(),
    } as never);
    // act
    const caller = appRouter.createCaller(ctx);
    await caller.follow.create(dummyRemoteUser.id);
    // assert
    expect(prismaMock.follow.create).toHaveBeenCalledWith({
      data: {
        followeeId: dummyRemoteUser.id,
        followerId: dummySessionUser.id,
        status: "SENT",
      },
      include: {
        followee: {
          select: {
            actorUrl: true,
            host: true,
          },
        },
      },
    });
    expect(mockedQueue.push).toHaveBeenCalledWith({
      runner: "relayActivity",
      params: {
        sender: dummySessionUser,
        activity: {
          "@context": [
            new URL("https://www.w3.org/ns/activitystreams"),
            new URL("https://w3id.org/security/v1"),
          ],
          actor: new URL("https://myhost.example.com/users/dummy_session"),
          id: new URL("https://myhost.example.com/follows/followId"),
          object: new URL("https://remote.example.com/users/dummy_remote"),
          type: "Follow",
        },
      },
    });
  });

  test("ローカルユーザー", async () => {
    // arrange
    const ctx = mockDeep<TRPCContext>();
    ctx.session = {
      user: dummySessionUser,
      expires: "",
    };
    prismaMock.follow.create.mockResolvedValue({
      id: "followId",
      followeeId: dummyLocalUser.id,
      followee: {
        host: dummyLocalUser.host,
      },
      followerId: dummySessionUser.id,
      status: "SENT",
      createdAt: new Date(),
    } as never);
    // act
    const caller = appRouter.createCaller(ctx);
    await caller.follow.create(dummyLocalUser.id);
    // assert
    expect(prismaMock.follow.create).toHaveBeenCalledWith({
      data: {
        followeeId: dummyLocalUser.id,
        followerId: dummySessionUser.id,
        status: "SENT",
      },
      include: {
        followee: {
          select: {
            actorUrl: true,
            host: true,
          },
        },
      },
    });
    expect(prismaMock.follow.update).toHaveBeenCalledWith({
      data: { status: "ACCEPTED" },
      where: { id: "followId" },
    });
    expect(mockedQueue.push).not.toHaveBeenCalled();
  });
});

describe("Undo follow", () => {
  test("リモートユーザー", async () => {
    // arrange
    const ctx = mockDeep<TRPCContext>();
    ctx.session = {
      user: dummySessionUser,
      expires: "",
    };
    prismaMock.follow.findFirst.mockResolvedValue({} as never);
    prismaMock.follow.delete.mockResolvedValue({
      id: "followId",
      followeeId: dummyRemoteUser.id,
      followee: {
        host: dummyRemoteUser.host,
        actorUrl: dummyRemoteUser.actorUrl,
      },
      followerId: dummySessionUser.id,
      status: "SENT",
      createdAt: new Date(),
    } as never);
    // act
    const caller = appRouter.createCaller(ctx);
    await caller.follow.create(dummyRemoteUser.id);
    // assert
    expect(prismaMock.follow.findFirst).toHaveBeenCalledWith({
      where: {
        followeeId: dummyRemoteUser.id,
        followerId: dummySessionUser.id,
      },
    });
    expect(prismaMock.follow.delete).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: dummyRemoteUser.id,
          followerId: dummySessionUser.id,
        },
      },
      include: {
        followee: {
          select: {
            actorUrl: true,
            host: true,
          },
        },
      },
    });
    expect(mockedQueue.push).toHaveBeenCalledWith({
      runner: "relayActivity",
      params: {
        sender: dummySessionUser,
        activity: {
          "@context": [
            new URL("https://www.w3.org/ns/activitystreams"),
            new URL("https://w3id.org/security/v1"),
          ],
          actor: new URL("https://myhost.example.com/users/dummy_session"),
          id: new URL("https://myhost.example.com/follows/followId?undo=true"),
          object: {
            type: "Follow",
            id: new URL("https://myhost.example.com/follows/followId"),
            actor: new URL("https://myhost.example.com/users/dummy_session"),
            object: new URL("https://remote.example.com/users/dummy_remote"),
          },
          type: "Undo",
        },
      },
    });
  });

  test("ローカルユーザー", async () => {
    // arrange
    const ctx = mockDeep<TRPCContext>();
    ctx.session = {
      user: dummySessionUser,
      expires: "",
    };
    prismaMock.follow.findFirst.mockResolvedValue({} as never);
    prismaMock.follow.delete.mockResolvedValue({
      id: "followId",
      followeeId: dummyLocalUser.id,
      followee: {
        host: dummyLocalUser.host,
      },
      followerId: dummySessionUser.id,
      status: "SENT",
      createdAt: new Date(),
    } as never);
    // act
    const caller = appRouter.createCaller(ctx);
    await caller.follow.create(dummyLocalUser.id);
    // assert
    expect(prismaMock.follow.delete).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: dummyLocalUser.id,
          followerId: dummySessionUser.id,
        },
      },
      include: {
        followee: {
          select: {
            actorUrl: true,
            host: true,
          },
        },
      },
    });
    expect(mockedQueue.push).not.toHaveBeenCalled();
  });
});
