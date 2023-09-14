import type { Follow } from "@prisma/client";

import { mockedPrisma } from "@/mocks/prisma";
import { relayActivityToInboxUrl } from "@/utils/relayActivity";

import { handle } from "./follow";

jest.mock("@/utils/relayActivity");
const mockedRelayActivityToInboxUrl = jest.mocked(relayActivityToInboxUrl);

const dummyLocalUser = {
  id: "dummyidlocal",
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
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/users/dummyidlocal/activity",
    };
    mockedPrisma.user.findUnique.mockResolvedValueOnce(dummyLocalUser as never);
    mockedPrisma.follow.create.mockResolvedValue({} as Follow);
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        actorUrl: "https://myhost.example.com/users/dummyidlocal/activity",
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
        id: expect.any(URL),
        type: "Accept",
        actor: new URL(activity.object),
        object: {
          type: "Follow",
          actor: new URL(activity.actor),
          object: new URL(activity.object),
        },
      },
    });
    expect(error).toBeUndefined();
  });
});
