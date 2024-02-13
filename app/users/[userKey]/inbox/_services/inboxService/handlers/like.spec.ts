import assert from "assert";

import { LocalNoteFactory } from "@/_shared/factories/note";
import { RemoteUserFactory } from "@/_shared/factories/user";
import { prisma } from "@/_shared/utils/prisma";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import { handle } from "./like";

describe("inboxLikeService", () => {
  test("受け取ったアクティビティに応じていいねを作成する", async () => {
    // arrange
    const note = await LocalNoteFactory.create();
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.actorUrl);
    const activity = {
      type: "Like",
      id: "https://remote.example.com/like/foobar",
      actor: remoteUser.actorUrl,
      object: `https://myhost.example.com/notes/${note.id}/activity`,
      content: "👍",
    };
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.like.findFirst()).toEqualPrisma({
      id: expect.any(String),
      userId: remoteUser.id,
      noteId: note.id,
      content: "👍",
      createdAt: expect.anyDate(),
    });
  });
  test("contentがなければ👍をデフォルトにする", async () => {
    // arrange
    const note = await LocalNoteFactory.create();
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.actorUrl);
    const activity = {
      type: "Like",
      id: "https://remote.example.com/like/foobar",
      actor: remoteUser.actorUrl,
      object: `https://myhost.example.com/notes/${note.id}/activity`,
    };
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.like.findFirst()).toEqualPrisma({
      id: expect.any(String),
      userId: remoteUser.id,
      noteId: note.id,
      content: "👍",
      createdAt: expect.anyDate(),
    });
  });
  test("不正なActivityならエラーを返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.actorUrl);
    const activity = {
      type: "Like",
      id: "https://remote.example.com/like/foobar",
      actor: remoteUser.actorUrl,
      // objectがない
    };
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeInstanceOf(ActivitySchemaValidationError);
  });
  test("URLが/notes/でなければエラーを返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.actorUrl);
    const activity = {
      type: "Like",
      id: "https://remote.example.com/like/foobar",
      actor: remoteUser.actorUrl,
      object: "https://myhost.example.com/invalid",
      content: "👍",
    };
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeInstanceOf(BadActivityRequestError);
  });
});
