import { mockedLogger } from "@/mocks/logger";
import { mockedPrisma } from "@/mocks/prisma";

import * as likeService from "./like";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./shared";

const dummyRemoteUser = {
  id: "dummyidremote",
};

const dummyLocalUser = {
  id: "dummyidlocal",
};

describe(likeService.name, () => {
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
    const error = await likeService.handle(activity, dummyRemoteUser as never);
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
    const error = await likeService.handle(activity, dummyRemoteUser as never);
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
  test("createに失敗したらログを出す", async () => {
    // arrange
    const activity = {
      type: "Like",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://myhost.example.com/notes/note_local",
    };
    mockedPrisma.like.create.mockRejectedValue(new Error());
    // act
    const error = await likeService.handle(activity, dummyRemoteUser as never);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledWith(expect.any(Error));
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
    const error = await likeService.handle(activity, dummyRemoteUser as never);
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
    const error = await likeService.handle(activity, dummyRemoteUser as never);
    // assert
    expect(error).toBeInstanceOf(BadActivityRequestError);
    expect(error!.message).toBe(
      "activityからいいね対象のノートIDを取得できませんでした",
    );
  });
});
