import { logger } from "@soshal/utils";
import { Matcher } from "jest-mock-extended";

import { queue } from "@/server/background/queue";
import { mockedPrisma } from "@/utils/mock";

import { follow } from "./follow";

jest.mock("@soshal/utils");
const mockedLogger = jest.mocked(logger);

jest.mock("@/server/background/queue");
const mockedQueue = jest.mocked(queue);

const dummyLocalUser = {
  id: "dummyidlocal",
  privateKey: "privateKey",
};

const dummyRemoteUser = {
  id: "dummyidremote",
};

export const object = <T>(expectedValue: T) =>
  new Matcher((actualValue) => {
    return JSON.stringify(expectedValue) == JSON.stringify(actualValue);
  }, "");

describe("フォロー", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Follow",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/users/dummyidlocal",
    };
    mockedPrisma.user.findFirst
      .calledWith(object({ where: { id: "dummyidlocal" } }))
      .mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const response = await follow(activity, dummyRemoteUser as never);
    // assert
    expect(mockedPrisma.follow.create).toHaveBeenCalledWith({
      data: {
        followeeId: dummyLocalUser.id,
        followerId: dummyRemoteUser.id,
      },
    });
    expect(mockedQueue.push).toHaveBeenCalledWith({
      runner: "relayActivity",
      params: {
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
      },
    });
    expect(response).toEqual({
      status: 200,
      message: "完了: フォロー",
    });
  });
});
