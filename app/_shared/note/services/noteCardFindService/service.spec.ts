import { LikeFactory } from "@/_shared/factories/like";
import {
  LocalNoteFactory,
  RemoteNoteFactory,
  RepostedNoteFactory,
} from "@/_shared/factories/note";
import { LocalUserFactory } from "@/_shared/factories/user";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";
import { prisma } from "@/_shared/utils/prisma";

import { noteCardFindService } from ".";

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
        isReposted: false,
        isMine: false,
        likes: [],
        quotes: [],
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
    test("自分の投稿である場合はisMineをtrueにする", async () => {
      // arrange
      const userId = await LocalUserFactory.createForConnect();
      const note = await LocalNoteFactory.create({
        user: {
          connect: userId,
        },
      });
      mockedGetSessionUserId.mockResolvedValueOnce(note.userId);
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard(note.id);
      // assert
      expect(noteCard?.isMine).toBe(true);
    });
    test("いいね済みの場合はisLikeをtrueにする", async () => {
      // arrange
      const user = await LocalUserFactory.createForConnect();
      const like = await LikeFactory.create({
        user: {
          connect: user,
        },
      });
      mockedGetSessionUserId.mockResolvedValueOnce(like.userId);
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard(
        like.noteId,
      );
      // assert
      expect(noteCard?.isLiked).toBe(true);
    });
    test("リポスト済み", async () => {
      // arrange
      const repostedNote = await RepostedNoteFactory.create();
      mockedGetSessionUserId.mockResolvedValueOnce(repostedNote.userId);
      // act
      const noteCard = await noteCardFindService.findUniqueNoteCard(
        repostedNote.id,
      );
      // assert
      expect(noteCard?.isReposted).toBe(true);
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
          isReposted: false,
          isMine: false,
          likes: [],
          quotes: [],
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
    test("publishedAtでソートする", async () => {
      // arrange
      const notes = await LocalNoteFactory.createList([
        { publishedAt: new Date("2024-01-01T00:00:00Z") },
        { publishedAt: new Date("2024-01-03T00:00:00Z") },
        { publishedAt: new Date("2024-01-02T00:00:00Z") },
      ]);
      // act
      const noteCards = await noteCardFindService.findManyNoteCards({
        count: 10,
      });
      // assert
      expect(noteCards[0]!.id).toBe(notes[1]!.id);
      expect(noteCards[1]!.id).toBe(notes[2]!.id);
      expect(noteCards[2]!.id).toBe(notes[0]!.id);
    });
    test("sinceからuntilまでのノートを取得する", async () => {
      // arrange
      const notes = await LocalNoteFactory.createList([
        { publishedAt: new Date("2024-01-01T00:00:00Z") },
        { publishedAt: new Date("2024-01-02T00:00:00Z") },
        { publishedAt: new Date("2024-01-03T00:00:00Z") },
      ]);
      // act
      const noteCards = await noteCardFindService.findManyNoteCards({
        count: 10,
        since: new Date("2024-01-01T00:00:01Z"), // 一つ目の投稿の1秒後
        until: new Date("2024-01-02T12:59:59Z"), // 三つ目の投稿の1秒前
      });
      // assert
      expect(noteCards).toHaveLength(1);
      expect(noteCards[0]!.id).toBe(notes[1]!.id);
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
