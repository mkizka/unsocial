import { LikeFactory } from "@/_shared/factories/like";
import { LocalNoteFactory, RemoteNoteFactory } from "@/_shared/factories/note";
import { LocalUserFactory } from "@/_shared/factories/user";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";
import { prisma } from "@/_shared/utils/prisma";

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

describe("noteCardFindService", () => {
  describe("findUniqueNoteCard", () => {
    test("カード表示のための形式にしたノートを返す", async () => {
      // arrange
      const data = await LocalNoteFactory.build();
      const note = await prisma.note.create({ data, include: { user: true } });
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard(note.id);
      // assert
      expect(noteCard).toEqualPrisma({
        attachmentUrls: [],
        attachments: [],
        content: note.content,
        createdAt: expect.anyDate(),
        id: note.id,
        isLiked: false,
        isMine: false,
        likes: [],
        publishedAt: expect.anyDate(),
        quote: null,
        quoteId: null,
        quotedBy: null,
        replies: [],
        replyTo: null,
        replyToId: null,
        url: `/notes/${note.id}`,
        user: {
          actorUrl: null,
          displayUsername: `@${note.user.preferredUsername}`,
          email: null,
          emailVerified: null,
          host: note.user.host,
          icon: null,
          iconHash: null,
          id: note.user.id,
          image: null,
          inboxUrl: null,
          lastFetchedAt: null,
          name: null,
          preferredUsername: note.user.preferredUsername,
          publicKey: null,
          summary: null,
          url: `/@${note.user.preferredUsername}`,
        },
        userId: note.userId,
      });
    });
    test("自分の投稿かついいね済み", async () => {
      // arrange
      const userId = await LocalUserFactory.createForConnect();
      const noteId = await LocalNoteFactory.createForConnect({
        user: {
          connect: userId,
        },
      });
      const like = await LikeFactory.create({
        user: {
          connect: userId,
        },
        note: {
          connect: noteId,
        },
      });
      mockedGetSessionUserId.mockResolvedValueOnce(like.userId);
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard(
        like.noteId,
      );
      // assert
      expect(noteCard?.isLiked).toBe(true);
      expect(noteCard?.isMine).toBe(true);
    });
    test("自分の投稿でなく未いいね", async () => {
      // arrange
      const like = await LikeFactory.create();
      mockedGetSessionUserId.mockResolvedValueOnce("otherUserId");
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard(
        like.noteId,
      );
      // assert
      expect(noteCard?.isLiked).toBe(false);
      expect(noteCard?.isMine).toBe(false);
    });
    test("他ホストのユーザーはURLを@user@example.comの形式にする", async () => {
      // arrange
      const note = await RemoteNoteFactory.create();
      mockedGetSessionUserId.mockResolvedValueOnce(note.userId);
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard(note.id);
      // assert
      expect(noteCard!.user.url).toBe(
        `/@${noteCard!.user.preferredUsername}@${noteCard!.user.host}`,
      );
    });
    test("quoteがある場合はquotedByを追加", async () => {
      // arrange
      const quote = await LocalNoteFactory.createForConnect();
      const data = await LocalNoteFactory.build({
        quote: {
          connect: quote,
        },
      });
      const quotedNote = await prisma.note.create({
        data,
        include: { user: true },
      });
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard(
        quotedNote.id,
      );
      // assert
      expect(noteCard?.quotedBy).toEqual({
        host: quotedNote.user.host,
        preferredUsername: quotedNote.user.preferredUsername,
        name: null,
        url: `/@${quotedNote.user.preferredUsername}`,
      });
    });
    test("ノートが無かった場合はgetSessionUserIdOrNullを呼ばない", async () => {
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard("noteId");
      // assert
      expect(mockedGetSessionUserId).not.toHaveBeenCalled();
      expect(noteCard).toEqual(null);
    });
  });

  describe("findManyNoteCards", () => {
    test("カード表示のための形式にしたノートを複数返す", async () => {
      // arrange
      await LocalNoteFactory.createList(11);
      // act
      const noteCards = await noteCardFindService.findManyNoteCards({
        count: 10,
      });
      // assert
      expect(noteCards).toHaveLength(10);
      for (const noteCard of noteCards) {
        expect(noteCard).toEqualPrisma({
          attachmentUrls: [],
          attachments: [],
          content: expect.any(String),
          createdAt: expect.anyDate(),
          id: expect.any(String),
          isLiked: false,
          isMine: false,
          likes: [],
          publishedAt: expect.anyDate(),
          quote: null,
          quoteId: null,
          quotedBy: null,
          replies: [],
          replyTo: null,
          replyToId: null,
          url: expect.any(String),
          user: {
            actorUrl: null,
            displayUsername: expect.any(String),
            email: null,
            emailVerified: null,
            host: expect.any(String),
            icon: null,
            iconHash: null,
            id: expect.any(String),
            image: null,
            inboxUrl: null,
            lastFetchedAt: null,
            name: null,
            preferredUsername: expect.any(String),
            publicKey: null,
            summary: null,
            url: expect.any(String),
          },
          userId: expect.any(String),
        });
      }
    });
    test("ノートが無かった場合はgetSessionUserIdOrNullを呼ばない", async () => {
      // act
      const noteCards = await noteCardFindService.findManyNoteCards({
        count: 10,
      });
      // assert
      expect(mockedGetSessionUserId).not.toHaveBeenCalled();
      expect(noteCards).toEqual([]);
    });
  });
});
