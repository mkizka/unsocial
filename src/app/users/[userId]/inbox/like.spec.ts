import { mockedPrisma } from "@/utils/mock";

import { like } from "./like";

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
    mockedPrisma.like.create.mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const response = await like(activity, dummyRemoteUser as never);
    // assert

    expect(mockedPrisma.like.create).toHaveBeenCalledWith({
      data: {
        noteId: "note_local",
        userId: dummyRemoteUser.id,
        content: activity.content,
      },
    });
    expect(response).toEqual({
      status: 200,
      message: "完了: いいね",
    });
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
    expect(response).toEqual({
      status: 400,
      message: expect.stringContaining("検証失敗"),
    });
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
    expect(response).toEqual({
      status: 400,
      message: "activityからいいね対象のノートIDを取得できませんでした",
    });
  });
});
