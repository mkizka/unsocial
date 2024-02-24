import { RemoteNoteFactory } from "@/_shared/factories/note";
import { RemoteUserFactory } from "@/_shared/factories/user";
import { prisma } from "@/_shared/utils/prisma";

import { handle } from "./delete";
import { ActivitySchemaValidationError } from "./errors";

describe("inboxDeleteService", () => {
  test("ノートの削除", async () => {
    // arrange
    const data = await RemoteNoteFactory.build();
    const note = await prisma.note.create({ data, include: { user: true } });
    const activity = {
      type: "Delete",
      actor: note.user.actorUrl!,
      object: {
        type: "Tombstone",
        id: note.url,
      },
    };
    // act
    const error = await handle(activity, {} as never);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.note.findFirst()).toBeNull();
  });
  test("削除対象のノートが無くてもエラーにしない", async () => {
    // arrange
    const activity = {
      type: "Delete",
      actor: "https://remote.example.com/u/dummy_remote",
      object: {
        type: "Tombstone",
        id: "https://remote.example.com/n/not_exist",
      },
    };
    // act
    const error = await handle(activity, {} as never);
    // assert
    expect(error).toBeUndefined();
  });
  test("ユーザーの削除", async () => {
    // arrange
    const user = await RemoteUserFactory.create();
    const activity = {
      type: "Delete",
      actor: user.actorUrl!,
      object: user.actorUrl!,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
    };
    // act
    const error = await handle(activity, {} as never);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.user.findFirst()).toBeNull();
  });
  test("削除対象のユーザーが無くてもエラーにしない", async () => {
    // arrange
    const activity = {
      type: "Delete",
      actor: "https://remote.example.com/u/dummy_remote",
      object: "https://remote.example.com/u/dummy_remote",
    };
    // act
    const error = await handle(activity, {} as never);
    // assert
    expect(error).toBeUndefined();
  });
  test("Delete以外のActivityはエラーにする", async () => {
    // arrange
    const activity = { type: "Dummy" };
    // act
    const error = await handle(activity, {} as never);
    // assert
    expect(error).toBeInstanceOf(ActivitySchemaValidationError);
  });
});
