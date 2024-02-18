import assert from "assert";

import { LocalNoteFactory } from "@/_shared/factories/note";
import { RemoteUserFactory } from "@/_shared/factories/user";
import { prisma } from "@/_shared/utils/prisma";

import { handle } from "./undo";

describe("inboxUndoService", () => {
  test("受け取ったアクティビティに応じていいねを削除し、いいね数を更新する", async () => {
    // arrange
    const note = await LocalNoteFactory.create({
      likesCount: 1,
    });
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.actorUrl);
    await prisma.like.create({
      data: {
        userId: remoteUser.id,
        noteId: note.id,
        content: "👍",
      },
    });
    const activity = {
      type: "Undo",
      id: "https://remote.example.com/undo/foobar",
      actor: remoteUser.actorUrl,
      object: {
        type: "Like",
        id: "https://remote.example.com/like/foobar",
        actor: remoteUser.actorUrl,
        object: `https://myhost.example.com/notes/${note.id}/activity`,
        content: "👍",
      },
    };
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.like.findFirst()).toBeNull();
    expect(await prisma.note.findFirst()).toMatchObject({
      likesCount: 0,
    });
  });
});
