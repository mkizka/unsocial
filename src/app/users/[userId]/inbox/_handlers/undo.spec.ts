import { Matcher } from "jest-mock-extended";

import { mockedPrisma } from "@/utils/mock";

import { undo } from "./undo";

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
    mockedPrisma.user.findFirst
      .calledWith(object({ where: { id: "dummyidlocal" } }))
      .mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const response = await undo(activity, dummyRemoteUser as never);
    // assert
    expect(mockedPrisma.follow.delete).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: dummyLocalUser.id,
          followerId: dummyRemoteUser.id,
        },
      },
    });
    expect(response).toEqual({
      status: 200,
      message: "完了: アンフォロー",
    });
  });
});
