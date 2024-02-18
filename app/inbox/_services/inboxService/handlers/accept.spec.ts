import { LocalToRemoteFollowFactory } from "@/_shared/factories/follow";
import { LocalUserFactory, RemoteUserFactory } from "@/_shared/factories/user";
import { prisma } from "@/_shared/utils/prisma";

import { handle } from "./accept";

describe("inboxAcceptService", () => {
  test("リモートのフォロイーから送られたAcceptを元にフォロー状態を更新できる", async () => {
    // arrange
    const follow = await prisma.follow.create({
      data: await LocalToRemoteFollowFactory.build(),
      include: {
        followee: true,
      },
    });
    const activity = {
      type: "Accept",
      id: "https://remote.example.com/12345",
      actor: follow.followee.actorUrl,
      object: {
        type: "Follow",
        actor: `https://myhost.example.com/users/${follow.followerId}/activity`,
        object: follow.followee.actorUrl,
      },
    };
    // act
    const error = await handle(activity, follow.followee);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.follow.findFirst()).toMatchObject({
      status: "ACCEPTED",
    });
  });
  test("対象のフォロワーが存在しない場合はエラーを返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    const activity = {
      type: "Accept",
      id: "https://remote.example.com/12345",
      actor: remoteUser.actorUrl,
      object: {
        type: "Follow",
        actor: `https://myhost.example.com/users/not-found-id/activity`,
        object: remoteUser.actorUrl,
      },
    };
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      message: "Acceptされたフォロワーが存在しませんでした",
    });
  });
  test("フォローが無い場合はエラーを投げる", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    const localUser = await LocalUserFactory.create();
    const activity = {
      type: "Accept",
      id: "https://remote.example.com/12345",
      actor: remoteUser.actorUrl,
      object: {
        type: "Follow",
        actor: `https://myhost.example.com/users/${localUser.id}/activity`,
        object: remoteUser.actorUrl,
      },
    };
    // act
    const promise = handle(activity, remoteUser);
    // assert
    await expect(promise).rejects.toMatchObject({
      code: "P2025",
    });
  });
  test("システムユーザーからのフォロー(リレー登録)によるAcceptの場合はfollowデータを作成する", async () => {
    // arrange
    const systemUser = await prisma.user.create({
      data: {
        preferredUsername: "myhost.example.com",
        host: "myhost.example.com",
      },
    });
    const remoteUser = await RemoteUserFactory.create();
    const activity = {
      type: "Accept",
      id: "https://remote.example.com/12345",
      actor: remoteUser.actorUrl,
      object: {
        type: "Follow",
        actor: `https://myhost.example.com/users/${systemUser.id}/activity`,
        object: "https://www.w3.org/ns/activitystreams#Public",
      },
    };
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.follow.findFirst()).toEqualPrisma({
      id: expect.any(String),
      followeeId: remoteUser.id,
      followerId: systemUser.id,
      status: "ACCEPTED",
      createdAt: expect.anyDate(),
    });
  });
});
