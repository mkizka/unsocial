import { LocalToRemoteFollowFactory } from "@/_shared/factories/follow";
import { RelayServerFactory } from "@/_shared/factories/relayServer";
import { LocalUserFactory, RemoteUserFactory } from "@/_shared/factories/user";
import { mockedLogger } from "@/_shared/mocks/logger";
import { systemUserService } from "@/_shared/user/services/systemUserService";
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
  test("フォローが無い場合はスキップ", async () => {
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
    await handle(activity, remoteUser);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      "承認されたフォローが存在しなかったのでスキップ",
    );
  });
  test("システムユーザーからのフォロー(リレー登録)によるAcceptの場合はリレーサーバーのステータスを更新する", async () => {
    // arrange
    const relayServer = await RelayServerFactory.create();
    const systemUser = await systemUserService.findOrCreateSystemUser();
    const remoteUser = await RemoteUserFactory.create({
      actorUrl: "https://relay.example.com/actor",
      inboxUrl: relayServer.inboxUrl,
    });
    const activity = {
      type: "Accept",
      id: "https://relay.example.com/12345",
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
    expect(await prisma.relayServer.findFirst()).toMatchObject({
      status: "ACCEPTED",
    });
  });
});
