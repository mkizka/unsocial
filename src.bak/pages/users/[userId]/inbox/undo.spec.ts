import { Matcher } from "jest-mock-extended";

import { prismaMock } from "../../../../__mocks__/db";
import { logger } from "../../../../utils/logger";
import { undo } from "./undo";

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

const dummyLocalUser = {
  id: "dummyidlocal",
};

const dummyRemoteUser = {
  id: "dummyidremote",
};

export const object = <T>(expectedValue: T) =>
  new Matcher((actualValue) => {
    return JSON.stringify(expectedValue) == JSON.stringify(actualValue);
  }, "");

describe("アンフォロー", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Undo",
      actor: "https://remote.example.com/u/dummy_remote",
      object: {
        type: "Follow",
        actor: "https://remote.example.com/u/dummy_remote",
        object: "https://myhost.example.com/users/dummyidlocal",
      },
    };
    prismaMock.user.findFirst
      .calledWith(object({ where: { id: "dummyidlocal" } }))
      .mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const response = await undo(activity, dummyRemoteUser as never);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: アンフォロー");
    expect(prismaMock.follow.delete).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: dummyLocalUser.id,
          followerId: dummyRemoteUser.id,
        },
      },
    });
    expect(response.status).toBe(200);
  });
});
