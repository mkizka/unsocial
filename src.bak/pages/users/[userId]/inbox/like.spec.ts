import { prismaMock } from "../../../../__mocks__/db";
import { logger } from "../../../../utils/logger";
import { like } from "./like";

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

const dummyRemoteUser = {
  id: "dummyidremote",
};

const dummyLocalUser = {
  id: "dummyidlocal",
};

describe("いいね", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Like",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/notes/note_local",
      content: "👍",
    };
    prismaMock.like.create.mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const response = await like(activity, dummyRemoteUser as never);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: いいね");
    expect(prismaMock.like.create).toHaveBeenCalledWith({
      data: {
        noteId: "note_local",
        userId: dummyRemoteUser.id,
        content: activity.content,
      },
    });
    expect(response.status).toBe(200);
  });
  test("不正なactivityなら400を返す", async () => {
    // arrange
    const activity = {
      type: "Like",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/notes/note_local",
      // contentがない
    };
    // act
    const response = await like(activity, dummyRemoteUser as never);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("検証失敗")
    );
    expect(response.status).toBe(400);
  });
  test("URLが/notes/でなければ400を返す", async () => {
    // arrange
    const activity = {
      type: "Like",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/foo/note_local",
      content: "👍",
    };
    // act
    const response = await like(activity, dummyRemoteUser as never);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      "検証失敗: ノートのURLではありません"
    );
    expect(response.status).toBe(400);
  });
});
