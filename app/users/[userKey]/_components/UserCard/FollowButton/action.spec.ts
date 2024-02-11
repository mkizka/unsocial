import type { Follow } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { mockedPrisma } from "@/_shared/mocks/prisma";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";

import { action } from "./action";

jest.mock("@/_shared/activitypub/apRelayService");
const mockedRelayActivityToInboxUrl = jest.mocked(
  apRelayService.relayActivityToInboxUrl,
);

jest.mock("next/cache");
const mockedRevalidatePath = jest.mocked(revalidatePath);

const dummyRemoteUser = {
  id: "dummy_remote",
  name: "Dummy",
  preferredUsername: "dummy",
  host: "remote.example.com",
  actorUrl: "https://remote.example.com/users/dummy_remote",
  inboxUrl: "https://remote.example.com/inbox",
};

const dummyLocalUser = {
  id: "dummy_local",
  name: "Dummy",
  preferredUsername: "dummy",
  host: "myhost.example.com",
};

const dummySessionUserId = "dummy_session";

describe("FollowButton/action", () => {
  test("リモートユーザー", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummySessionUserId);
    mockedPrisma.follow.create.mockResolvedValue({
      id: "followId",
      followeeId: dummyRemoteUser.id,
      followee: {
        // @ts-ignore
        host: dummyRemoteUser.host,
        actorUrl: dummyRemoteUser.actorUrl,
        inboxUrl: dummyRemoteUser.inboxUrl,
      },
      followerId: dummySessionUserId,
      status: "SENT",
      createdAt: new Date(),
    });
    // act
    await action({ followeeId: dummyRemoteUser.id });
    // assert
    expect(mockedPrisma.follow.create).toHaveBeenCalledWith({
      data: {
        followeeId: dummyRemoteUser.id,
        followerId: dummySessionUserId,
        status: "SENT",
      },
      include: {
        followee: true,
      },
    });
    expect(mockedRelayActivityToInboxUrl).toHaveBeenCalledWith({
      userId: dummySessionUserId,
      inboxUrl: new URL(dummyRemoteUser.inboxUrl),
      activity: expect.objectContaining({
        type: "Follow",
      }),
    });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/users/dummy_remote");
  });
  test("ローカルユーザー", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummySessionUserId);
    mockedPrisma.follow.create.mockResolvedValue({
      id: "followId",
      followeeId: dummyLocalUser.id,
      followee: {
        // @ts-ignore
        host: dummyLocalUser.host,
      },
      followerId: dummySessionUserId,
      status: "SENT",
      createdAt: new Date(),
    });
    // act
    await action({ followeeId: dummyLocalUser.id });
    // assert
    expect(mockedPrisma.follow.create).toHaveBeenCalledWith({
      data: {
        followeeId: dummyLocalUser.id,
        followerId: dummySessionUserId,
        status: "SENT",
      },
      include: {
        followee: true,
      },
    });
    expect(mockedPrisma.follow.update).toHaveBeenCalledWith({
      data: { status: "ACCEPTED" },
      where: { id: "followId" },
    });
    expect(mockedRelayActivityToInboxUrl).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/users/dummy_local");
  });
  test("リモートユーザー(解除)", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummySessionUserId);
    mockedPrisma.follow.findFirst.mockResolvedValue({} as Follow);
    mockedPrisma.follow.delete.mockResolvedValue({
      id: "followId",
      followeeId: dummyRemoteUser.id,
      followee: {
        // @ts-ignore
        host: dummyRemoteUser.host,
        actorUrl: dummyRemoteUser.actorUrl,
        inboxUrl: dummyRemoteUser.inboxUrl,
      },
      followerId: dummySessionUserId,
      status: "SENT",
      createdAt: new Date(),
    });
    // act
    await action({ followeeId: dummyRemoteUser.id });
    // assert
    expect(mockedPrisma.follow.findFirst).toHaveBeenCalledWith({
      where: {
        followeeId: dummyRemoteUser.id,
        followerId: dummySessionUserId,
      },
    });
    expect(mockedPrisma.follow.delete).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: dummyRemoteUser.id,
          followerId: dummySessionUserId,
        },
      },
      include: {
        followee: true,
      },
    });
    expect(mockedRelayActivityToInboxUrl).toHaveBeenCalledWith({
      userId: dummySessionUserId,
      inboxUrl: new URL(dummyRemoteUser.inboxUrl),
      activity: expect.objectContaining({
        type: "Undo",
      }),
    });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/users/dummy_remote");
  });
  test("ローカルユーザー(解除)", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummySessionUserId);
    mockedPrisma.follow.findFirst.mockResolvedValue({} as never);
    mockedPrisma.follow.delete.mockResolvedValue({
      id: "followId",
      followeeId: dummyLocalUser.id,
      followee: {
        // @ts-ignore
        host: dummyLocalUser.host,
      },
      followerId: dummySessionUserId,
      status: "SENT",
      createdAt: new Date(),
    });
    // act
    await action({ followeeId: dummyLocalUser.id });
    // assert
    expect(mockedPrisma.follow.delete).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: dummyLocalUser.id,
          followerId: dummySessionUserId,
        },
      },
      include: {
        followee: true,
      },
    });
    expect(mockedRelayActivityToInboxUrl).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/users/dummy_local");
  });
});
