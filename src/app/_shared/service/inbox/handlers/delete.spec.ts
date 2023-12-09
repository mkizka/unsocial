import { mockedPrisma } from "@/app/_mocks/prisma";

import { handle } from "./delete";

describe("inboxDeleteService", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Delete",
      actor: "https://remote.example.com/u/dummy_remote",
      object: {
        type: "Tombstone",
        id: "https://remote.example.com/n/note_remote",
      },
    };
    // act
    const error = await handle(activity, {} as never);
    // assert
    expect(mockedPrisma.note.deleteMany).toHaveBeenCalledWith({
      where: {
        url: activity.object.id,
      },
    });
    expect(error).toBeUndefined();
  });
});
