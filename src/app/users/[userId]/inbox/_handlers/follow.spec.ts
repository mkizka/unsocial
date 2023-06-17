import { mockedPrisma, objectMatcher } from "@/utils/mock";
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
    mockedPrisma.user.findFirst
      .calledWith(objectMatcher({ where: { id: "dummyidlocal" } }))
      .mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const response = await follow(activity, dummyRemoteUser as never);
    // assert
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
