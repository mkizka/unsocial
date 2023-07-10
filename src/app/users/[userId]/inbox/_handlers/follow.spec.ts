import { mockedPrisma } from "@/mocks/prisma";
import { relayActivityToInboxUrl } from "@/utils/relayActivity";

import { follow } from "./follow";

jest.mock("@/utils/relayActivity");
const mockedRelayActivityToInboxUrl = jest.mocked(relayActivityToInboxUrl);

const dummyLocalUser = {
  id: "dummyidlocal",
  privateKey: "privateKey",
};

const dummyRemoteUser = {
  id: "dummyidremote",
  inboxUrl: "https://remote.example.com/inbox",
};

describe("フォロー", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Follow",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/users/dummyidlocal/activity",
    };
    mockedPrisma.user.findFirst.mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const response = await follow(activity, dummyRemoteUser as never);
    // assert
    expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: "dummyidlocal" },
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
      sender: {
        id: dummyLocalUser.id,
        privateKey: dummyLocalUser.privateKey,
      },
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
    expect(response).toEqual({
      status: 200,
      message: "完了: フォロー",
    });
  });
});
