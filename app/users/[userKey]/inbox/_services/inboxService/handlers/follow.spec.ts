import { apReplayService } from "@/_shared/activitypub/apRelayService";
import { LocalUserFactory, RemoteUserFactory } from "@/_shared/factories/user";
import { mockedLogger } from "@/_shared/mocks/logger";
import { userFindService } from "@/_shared/user/services/userFindService";
import { prisma } from "@/_shared/utils/prisma";

import { handle } from "./follow";

jest.mock("@/_shared/activitypub/apRelayService");
const mockedRelayActivityToInboxUrl = jest.mocked(
  apReplayService.relayActivityToInboxUrl,
);

jest.mock("@/_shared/user/services/userFindService");
const mockedUserFindService = jest.mocked(userFindService);

describe("inboxFollowService", () => {
  test("正常系", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    const localUser = await LocalUserFactory.create();
    mockedUserFindService.findOrFetchUserByActor.mockResolvedValue(localUser);
    const activity = {
      type: "Follow",
      id: "https://remote.example.com/follows/foobar",
      actor: remoteUser.actorUrl!,
      object: `https://myhost.example.com/users/${localUser.id}/activity`,
    };
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.follow.findFirst()).toEqualPrisma({
      id: expect.any(String),
      followeeId: localUser.id,
      followerId: remoteUser.id,
      status: "ACCEPTED",
      createdAt: expect.anyDate(),
    });
    expect(mockedRelayActivityToInboxUrl).toHaveBeenCalledWith({
      inboxUrl: new URL(remoteUser.inboxUrl!),
      userId: localUser.id,
      activity: {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          "https://w3id.org/security/v1",
        ],
        id: expect.any(String),
        type: "Accept",
        actor: activity.object,
        object: activity,
      },
    });
  });
  test("同じフォロー関係が送られてきてもエラーにしない", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    const localUser = await LocalUserFactory.create();
    mockedUserFindService.findOrFetchUserByActor.mockResolvedValue(localUser);
    const activity = {
      type: "Follow",
      id: "https://remote.example.com/follows/foobar",
      actor: remoteUser.actorUrl!,
      object: `https://myhost.example.com/users/${localUser.id}/activity`,
    };
    // act
    const error1 = await handle(activity, remoteUser);
    const error2 = await handle(activity, remoteUser);
    // assert
    expect(error1).toBeUndefined();
    expect(error2).toBeUndefined();
    expect(mockedLogger.info).toHaveBeenCalledWith(
      `すでに存在するフォロー関係のためスキップ`,
    );
    expect(mockedRelayActivityToInboxUrl).toHaveBeenCalledWith({
      inboxUrl: new URL(remoteUser.inboxUrl!),
      userId: localUser.id,
      activity: {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          "https://w3id.org/security/v1",
        ],
        id: expect.any(String),
        type: "Accept",
        actor: activity.object,
        object: activity,
      },
    });
  });
});
