import { mockedPrisma } from "@/mocks/prisma";

import { accept } from "./accept";

const dummyRemoteUser = {
  id: "dummy_remote",
} as never;

const dummyLocalUser = {
  id: "dummy_local",
} as never;

describe("フォロー承認", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Accept",
      actor: "https://remote.example.com/u/dummy_remote",
      object: {
        type: "Follow",
        actor: "https://myhost.example.com/users/dummy_local",
        object: "https://remote.example.com/u/dummy_remote",
      },
    };
    mockedPrisma.user.findFirst.mockResolvedValue(dummyLocalUser);
    // act
    const response = await accept(activity, dummyRemoteUser);
    // assert
    expect(mockedPrisma.follow.update).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: "dummy_remote",
          followerId: "dummy_local",
        },
      },
      data: {
        status: "ACCEPTED",
      },
    });
    expect(response).toEqual({
      status: 200,
      message: "完了: フォロー承認",
    });
  });
});
