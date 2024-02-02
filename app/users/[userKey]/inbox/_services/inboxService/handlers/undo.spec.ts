import { mockedPrisma } from "@/_shared/mocks/prisma";

import { handle } from "./undo";

const dummyLocalUser = {
  id: "dummyidlocal",
  host: "myhost.example.com",
};

const dummyRemoteUser = {
  id: "dummyidremote",
};

describe("inboxUndoService", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Undo",
      id: "https://remote.example.com/undo/foobar",
      actor: "https://remote.example.com/u/dummy_remote",
      object: {
        type: "Follow",
        id: "https://remote.example.com/follows/foobar",
        actor: "https://remote.example.com/u/dummy_remote",
        object: "https://myhost.example.com/users/dummyidlocal",
      },
    };
    mockedPrisma.user.findUnique.mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(error).toBeUndefined();
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        actorUrl: "https://myhost.example.com/users/dummyidlocal",
      },
    });
    expect(mockedPrisma.follow.delete).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: dummyLocalUser.id,
          followerId: dummyRemoteUser.id,
        },
      },
    });
  });
});
