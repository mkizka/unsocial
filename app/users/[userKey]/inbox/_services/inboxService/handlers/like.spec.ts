import { mockedPrisma } from "@/_mocks/prisma";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import { handle } from "./like";

const dummyRemoteUser = {
  id: "dummyidremote",
};

const dummyLocalUser = {
  id: "dummyidlocal",
};

describe("inboxLikeService", () => {
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
    const error = await handle(activity, dummyRemoteUser as never);
    // assert

    expect(mockedPrisma.like.create).toHaveBeenCalledWith({
      data: {
        noteId: "note_local",
        userId: dummyRemoteUser.id,
        content: activity.content,
      },
    });
    expect(error).toBeUndefined();
  });
  test("contentがなければ👍をデフォルトにする", async () => {
    // arrange
    const activity = {
      type: "Like",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/notes/note_local",
    };
    mockedPrisma.like.create.mockResolvedValueOnce(dummyLocalUser as never);
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(mockedPrisma.like.create).toHaveBeenCalledWith({
      data: {
        noteId: "note_local",
        userId: dummyRemoteUser.id,
        content: "👍",
      },
    });
    expect(error).toBeUndefined();
  });
  test("不正なactivityならエラーを返す", async () => {
    // arrange
    const activity = {
      type: "Like",
      actor: "https://remote.example.com/u/dummy_remote",
      // objectがない
    };
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(error).toBeInstanceOf(ActivitySchemaValidationError);
    expect(error!.message).toEqual(expect.stringContaining("Required"));
  });
  test("URLが/notes/でなければエラーを返す", async () => {
    // arrange
    const activity = {
      type: "Like",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/foo/note_local",
      content: "👍",
    };
    // act
    const error = await handle(activity, dummyRemoteUser as never);
    // assert
    expect(error).toBeInstanceOf(BadActivityRequestError);
    expect(error!.message).toEqual(
      expect.stringContaining(
        "activityからいいね対象のノートIDを取得できませんでした",
      ),
    );
  });
});
