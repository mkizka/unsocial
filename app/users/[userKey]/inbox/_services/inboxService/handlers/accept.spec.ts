import { mockedPrisma } from "@/_shared/mocks/prisma";

import { handle } from "./accept";

const dummyRemoteUser = {
  id: "dummy_remote",
} as never;

const dummyLocalUser = {
  id: "dummy_local",
  host: "myhost.example.com",
} as never;

describe("inboxAcceptService", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Accept",
      id: "https://remote.example.com/12345",
      actor: "https://remote.example.com/u/dummy_remote",
      object: {
        type: "Follow",
        actor: "https://myhost.example.com/users/dummy_local",
        object: "https://remote.example.com/u/dummy_remote",
      },
    };
    mockedPrisma.user.findUnique.mockResolvedValue(dummyLocalUser);
    // act
    const error = await handle(activity, dummyRemoteUser);
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
    expect(error).toBeUndefined();
  });
});
