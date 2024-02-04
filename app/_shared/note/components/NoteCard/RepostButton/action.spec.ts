import { LocalNoteFactory } from "@/_shared/factories/note";
import { LocalUserFactory } from "@/_shared/factories/user";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

describe("RepostButton/action", () => {
  test("ノートをリポスト出来る", async () => {
    // arrange
    const noteToRepost = await LocalNoteFactory.create();
    const user = await LocalUserFactory.create();
    mockedGetSessionUserId.mockResolvedValue(user.id);
    // act
    await action({ noteId: noteToRepost.id });
    // assert
    const noteWithQuote = await prisma.note.findFirst({
      where: {
        userId: user.id,
        quote: {
          id: noteToRepost.id,
        },
      },
    });
    expect(noteWithQuote).not.toBeNull();
  });
  test("リポストしたノートを削除できる", async () => {
    // arrange
    const noteToRepost = await LocalNoteFactory.create();
    const user = await LocalUserFactory.create();
    mockedGetSessionUserId.mockResolvedValue(user.id);
    await action({ noteId: noteToRepost.id });
    // act
    await action({ noteId: noteToRepost.id });
    // assert
    const noteWithQuote = await prisma.note.findFirst({
      where: {
        userId: user.id,
        quote: {
          id: noteToRepost.id,
        },
      },
    });
    expect(noteWithQuote).toBeNull();
  });
});
