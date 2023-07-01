import type { Note } from "@prisma/client";

import { mockedPrisma } from "@/mocks/prisma";
import { mockedGetUser } from "@/mocks/session";

import type { NoteCard } from "./note";
import {
  findManyNoteCards,
  findManyNoteCardsByUserId,
  findUniqueNoteCard,
} from "./note";

const dummyNote = {
  id: "noteId",
  userId: "userId",
  user: {
    preferredUsername: "preferredUsername",
    host: "remote.example.com",
  },
  likes: [
    { id: "likeId", userId: "userId" },
    { id: "likeId2", userId: "userId2" },
  ],
};

const expectNote = (note: NoteCard | null) => {
  expect(note).toMatchObject(dummyNote);
  expect(note?.isMine).toBe(true);
  expect(note?.isLiked).toBe(true);
  expect(note?.url).toBe("/notes/noteId");
  expect(note?.user).toMatchObject(dummyNote.user);
  expect(note?.user.displayUsername).toBe(
    "@preferredUsername@remote.example.com"
  );
  expect(note?.user.url).toBe("/@preferredUsername@remote.example.com");
};

describe("noteService", () => {
  describe("findUniqueNoteCard", () => {
    test("自分の投稿かついいね済み", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(
        dummyNote as unknown as Note
      );
      mockedGetUser.mockResolvedValueOnce({
        id: "userId",
        privateKey: "privateKey",
      });
      // act
      const note = await findUniqueNoteCard("noteId");
      // assert
      expectNote(note);
    });
    test("自分の投稿でない", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(
        dummyNote as unknown as Note
      );
      mockedGetUser.mockResolvedValueOnce({
        id: "otherUserId",
        privateKey: "privateKey",
      });
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
      mockedGetUser.mockResolvedValueOnce({
        id: "userId",
        privateKey: "privateKey",
      });
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
      mockedGetUser.mockResolvedValueOnce({
        id: "userId",
        privateKey: "privateKey",
      });
      // act
      const note = await findUniqueNoteCard("noteId");
      // assert
      expect(note?.user.url).toBe("/@preferredUsername");
    });
    test("ノートが無かった場合はgetUserを呼ばない", async () => {
      // arrange
      mockedPrisma.note.findUnique.mockResolvedValueOnce(null);
      // act
      const notes = await findUniqueNoteCard("noteId");
      // assert
      expect(mockedGetUser).not.toBeCalled();
      expect(notes).toEqual(null);
    });
  });
  describe("findManyNoteCards", () => {
    test("正常系", async () => {
      // arrange
      mockedPrisma.note.findMany.mockResolvedValueOnce([
        dummyNote,
      ] as unknown as Note[]);
      mockedGetUser.mockResolvedValueOnce({
        id: "userId",
        privateKey: "privateKey",
      });
      // act
      const [note] = await findManyNoteCards();
      // assert
      expectNote(note!);
    });
    test("ノートが無かった場合はgetUserを呼ばない", async () => {
      // arrange
      mockedPrisma.note.findMany.mockResolvedValueOnce([]);
      // act
      const notes = await findManyNoteCards();
      // assert
      expect(mockedGetUser).not.toBeCalled();
      expect(notes).toEqual([]);
    });
  });
  describe("findManyNoteCardsByUserId", () => {
    test("正常系", async () => {
      // arrange
      mockedPrisma.note.findMany.mockResolvedValueOnce([
        dummyNote,
      ] as unknown as Note[]);
      mockedGetUser.mockResolvedValueOnce({
        id: "userId",
        privateKey: "privateKey",
      });
      // act
      const [note] = await findManyNoteCardsByUserId("noteId");
      // assert
      expectNote(note!);
    });
    test("ノートが無かった場合はgetUserを呼ばない", async () => {
      // arrange
      mockedPrisma.note.findMany.mockResolvedValueOnce([]);
      // act
      const notes = await findManyNoteCardsByUserId("noteId");
      // assert
      expect(mockedGetUser).not.toBeCalled();
      expect(notes).toEqual([]);
    });
  });
});
