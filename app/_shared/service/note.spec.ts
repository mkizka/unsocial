import type { Note } from "@prisma/client";

import { mockedPrisma } from "@/_mocks/prisma";
import { mockedGetSessionUserIdOrNull } from "@/_mocks/session";

import type { NoteCard } from "./note";
import { findManyNoteCards, findUniqueNoteCard } from "./note";

const dummyNote = {
  id: "noteId",
  userId: "userId",
  user: {
    preferredUsername: "preferredUsername",
    host: "remote.example.com",
  },
  attachments: [],
  likes: [
    { id: "likeId", userId: "userId" },
    { id: "likeId2", userId: "userId2" },
  ],
  replies: [],
};

const dummySince = new Date("2023-01-01T00:00:00.000Z");
const dummyUntil = new Date("2023-01-01T00:00:00.000Z");

const expectNote = (note: NoteCard | null) => {
  expect(note).toMatchObject(dummyNote);
  expect(note?.isMine).toBe(true);
  expect(note?.isLiked).toBe(true);
  expect(note?.url).toBe("/notes/noteId");
  expect(note?.user).toMatchObject(dummyNote.user);
  expect(note?.user.displayUsername).toBe(
    "@preferredUsername@remote.example.com",
  );
  expect(note?.user.url).toBe("/@preferredUsername@remote.example.com");
};

const include = {
  user: true,
  attachments: true,
  replyTo: {
    include: {
      user: true,
      attachments: true,
      likes: {
        include: {
          user: true,
        },
      },
    },
  },
  replies: {
    include: {
      user: true,
      attachments: true,
      replies: true,
      likes: {
        include: {
          user: true,
        },
      },
    },
  },
  likes: {
    include: {
      user: true,
    },
  },
};

describe("noteService", () => {
  describe("findUniqueNoteCard", () => {
    test("自分の投稿かついいね済み", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(
        dummyNote as unknown as Note,
      );
      mockedGetSessionUserIdOrNull.mockResolvedValueOnce("userId");
      // act
      const note = await findUniqueNoteCard("noteId");
      // assert
      expectNote(note);
      expect(mockedPrisma.note.findUnique).toBeCalledWith({
        where: { id: "noteId" },
        include,
      });
    });
    test("自分の投稿でない", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(
        dummyNote as unknown as Note,
      );
      mockedGetSessionUserIdOrNull.mockResolvedValueOnce("otherUserId");
      // act
      const note = await findUniqueNoteCard("noteId");
      // assert
      expect(note?.isMine).toBe(false);
    });
    test("いいね済みでない", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce({
        ...dummyNote,
        likes: [{ id: "likeId", userId: "otherUserId" }],
      } as unknown as Note);
      mockedGetSessionUserIdOrNull.mockResolvedValueOnce("userId");
      // act
      const note = await findUniqueNoteCard("noteId");
      // assert
      expect(note?.isLiked).toBe(false);
    });
    test("自ホストのユーザーはドメインを省略", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce({
        ...dummyNote,
        user: {
          preferredUsername: "preferredUsername",
          host: "myhost.example.com",
        },
      } as unknown as Note);
      mockedGetSessionUserIdOrNull.mockResolvedValueOnce("userId");
      // act
      const note = await findUniqueNoteCard("noteId");
      // assert
      expect(note?.user.url).toBe("/@preferredUsername");
    });
    test("ノートが無かった場合はgetSessionUserIdOrNullを呼ばない", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(null);
      // act
      const notes = await findUniqueNoteCard("noteId");
      // assert
      expect(mockedGetSessionUserIdOrNull).not.toHaveBeenCalled();
      expect(notes).toEqual(null);
    });
  });
  describe("findManyNoteCards", () => {
    test("正常系", async () => {
      // arrange
      mockedPrisma.note.findMany.mockResolvedValueOnce([
        dummyNote,
      ] as unknown as Note[]);
      mockedGetSessionUserIdOrNull.mockResolvedValueOnce("userId");
      // act
      const [note] = await findManyNoteCards({
        since: dummySince,
        until: dummyUntil,
        count: 10,
      });
      // assert
      expectNote(note!);
      expect(mockedPrisma.note.findMany).toBeCalledWith({
        include,
        take: 10,
        where: {
          publishedAt: {
            gt: dummySince,
            lt: dummyUntil,
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
      });
    });
    test("ノートが無かった場合はgetSessionUserIdOrNullを呼ばない", async () => {
      // arrange
      mockedPrisma.note.findMany.mockResolvedValueOnce([]);
      // act
      const notes = await findManyNoteCards({
        since: dummySince,
        until: dummyUntil,
        count: 10,
      });
      // assert
      expect(mockedGetSessionUserIdOrNull).not.toHaveBeenCalled();
      expect(notes).toEqual([]);
    });
  });
});
