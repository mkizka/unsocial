import type { Note, Prisma } from "@prisma/client";

import { mockedPrisma } from "@/_shared/mocks/prisma";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";

import { noteCardFindService } from ".";

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

const expectNote = (note: noteCardFindService.NoteCard | null) => {
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

const includeNoteCard = {
  user: true,
  attachments: true,
  likes: {
    include: {
      user: true,
    },
  },
} satisfies Prisma.NoteInclude;

const includeNoteCardWithReplies = {
  ...includeNoteCard,
  quote: {
    include: includeNoteCard,
  },
  replyTo: {
    include: includeNoteCard,
  },
  replies: {
    include: {
      ...includeNoteCard,
      replies: true,
    },
  },
} satisfies Prisma.NoteInclude;

describe("noteService", () => {
  describe("noteCardFindService.findUniqueNoteCard", () => {
    test("自分の投稿かついいね済み", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(
        dummyNote as unknown as Note,
      );
      mockedGetSessionUserId.mockResolvedValueOnce("userId");
      // act
      const note = await noteCardFindService.findUniqueNoteCard("noteId");
      // assert
      expectNote(note);
      expect(mockedPrisma.note.findUnique).toBeCalledWith({
        where: { id: "noteId" },
        include: includeNoteCardWithReplies,
      });
    });
    test("自分の投稿でない", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(
        dummyNote as unknown as Note,
      );
      mockedGetSessionUserId.mockResolvedValueOnce("otherUserId");
      // act
      const note = await noteCardFindService.findUniqueNoteCard("noteId");
      // assert
      expect(note?.isMine).toBe(false);
    });
    test("いいね済みでない", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce({
        ...dummyNote,
        likes: [{ id: "likeId", userId: "otherUserId" }],
      } as unknown as Note);
      mockedGetSessionUserId.mockResolvedValueOnce("userId");
      // act
      const note = await noteCardFindService.findUniqueNoteCard("noteId");
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
      mockedGetSessionUserId.mockResolvedValueOnce("userId");
      // act
      const note = await noteCardFindService.findUniqueNoteCard("noteId");
      // assert
      expect(note?.user.url).toBe("/@preferredUsername");
    });
    test("ノートが無かった場合はgetSessionUserIdOrNullを呼ばない", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(null);
      // act
      const notes = await noteCardFindService.findUniqueNoteCard("noteId");
      // assert
      expect(mockedGetSessionUserId).not.toHaveBeenCalled();
      expect(notes).toEqual(null);
    });
  });
  describe("findManyNoteCards", () => {
    test("正常系", async () => {
      // arrange
      mockedPrisma.note.findMany.mockResolvedValueOnce([
        dummyNote,
      ] as unknown as Note[]);
      mockedGetSessionUserId.mockResolvedValueOnce("userId");
      // act
      const [note] = await noteCardFindService.findManyNoteCards({
        since: dummySince,
        until: dummyUntil,
        count: 10,
      });
      // assert
      expectNote(note!);
      expect(mockedPrisma.note.findMany).toBeCalledWith({
        include: includeNoteCardWithReplies,
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
      const notes = await noteCardFindService.findManyNoteCards({
        since: dummySince,
        until: dummyUntil,
        count: 10,
      });
      // assert
      expect(mockedGetSessionUserId).not.toHaveBeenCalled();
      expect(notes).toEqual([]);
    });
  });
});
