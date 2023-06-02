import type { Follow, User } from "@soshal/database";
import type { Session } from "next-auth";

import { queue } from "@/server/background/queue";
import { getServerSession } from "@/utils/getServerSession";
import { mockedPrisma } from "@/utils/mock";

import { action } from "./action";

jest.mock("@/utils/getServerSession");
const mockedGetServerSession = jest.mocked(getServerSession);

jest.mock("@/server/background/queue");
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

const dummySessionUser = {
  id: "dummy_session",
  privateKey: "privateKey",
};

describe("FollowButton/action", () => {
  test("リモートユーザー", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({
      user: dummySessionUser,
    } as Session);
    mockedPrisma.follow.create.mockResolvedValue({
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
    await action({ followeeId: dummyRemoteUser.id });
    // assert
    expect(mockedPrisma.follow.create).toHaveBeenCalledWith({
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
        activity: expect.objectContaining({
          type: "Follow",
        }),
      },
    });
  });
  test("ローカルユーザー", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({
      user: dummySessionUser,
    } as Session);
    mockedPrisma.follow.create.mockResolvedValue({
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
    await action({ followeeId: dummyLocalUser.id });
    // assert
    expect(mockedPrisma.follow.create).toHaveBeenCalledWith({
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
    expect(mockedPrisma.follow.update).toHaveBeenCalledWith({
      data: { status: "ACCEPTED" },
      where: { id: "followId" },
    });
    expect(mockedQueue.push).not.toHaveBeenCalled();
  });
  test("リモートユーザー(解除)", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({
      user: dummySessionUser,
    } as Session);
    mockedPrisma.follow.findFirst.mockResolvedValue({} as Follow);
    mockedPrisma.follow.delete.mockResolvedValue({
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
    await action({ followeeId: dummyRemoteUser.id });
    // assert
    expect(mockedPrisma.follow.findFirst).toHaveBeenCalledWith({
      where: {
        followeeId: dummyRemoteUser.id,
        followerId: dummySessionUser.id,
      },
    });
    expect(mockedPrisma.follow.delete).toHaveBeenCalledWith({
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
        activity: expect.objectContaining({
          type: "Undo",
        }),
      },
    });
  });
  test("ローカルユーザー(解除)", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({
      user: dummySessionUser,
    } as Session);
    mockedPrisma.follow.findFirst.mockResolvedValue({} as never);
    mockedPrisma.follow.delete.mockResolvedValue({
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
    await action({ followeeId: dummyLocalUser.id });
    // assert
    expect(mockedPrisma.follow.delete).toHaveBeenCalledWith({
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
