import { prismaMock } from "../../../../__mocks__/db";
import { logger } from "../../../../utils/logger";
import { delete_ } from "./delete";

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

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
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: ノート削除");
    expect(prismaMock.note.deleteMany).toHaveBeenCalledWith({
      where: {
        url: activity.object.id,
      },
    });
    expect(response.status).toBe(200);
  });
});
