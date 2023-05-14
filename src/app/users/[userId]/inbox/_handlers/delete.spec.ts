import { mockedPrisma } from "@/utils/mock";

import { delete_ } from "./delete";

describe("ノート削除", () => {
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
    const response = await delete_(activity, {} as never);
    // assert
    expect(mockedPrisma.note.deleteMany).toHaveBeenCalledWith({
      where: {
        url: activity.object.id,
      },
    });
    expect(response).toEqual({
      status: 200,
      message: "完了: ノート削除",
    });
  });
});
