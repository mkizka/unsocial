import type { Follow } from "@prisma/client";

import { apReplayService } from "@/_shared/activitypub/apRelayService";
import { mockedPrisma } from "@/_shared/mocks/prisma";

import { handle } from "./follow";

jest.mock("@/_shared/activitypub/apRelayService");
const mockedRelayActivityToInboxUrl = jest.mocked(
  apReplayService.relayActivityToInboxUrl,
);

const dummyLocalUser = {
  id: "dummyidlocal",
  host: "myhost.example.com",
  credentials: {
    privateKey: "privateKey",
  },
};

const dummyRemoteUser = {
  id: "dummyidremote",
  inboxUrl: "https://remote.example.com/inbox",
};

describe("inboxFollowService", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Follow",
      id: "https://remote.example.com/follows/foobar",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/users/dummyidlocal/activity",
    };
    mockedPrisma.user.findUnique.mockResolvedValueOnce(dummyLocalUser as never);
    mockedPrisma.follow.create.mockResolvedValue({} as Follow);
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(error).toBeUndefined();
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: "dummyidlocal",
      },
    });
    expect(mockedPrisma.follow.create).toHaveBeenCalledWith({
      data: {
        followeeId: dummyLocalUser.id,
        followerId: dummyRemoteUser.id,
        status: "ACCEPTED",
      },
    });
    expect(mockedRelayActivityToInboxUrl).toHaveBeenCalledWith({
      inboxUrl: new URL(dummyRemoteUser.inboxUrl),
      userId: dummyLocalUser.id,
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