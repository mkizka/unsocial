import assert from "assert";
import { http, HttpResponse } from "msw";

import { LikeFactory, RemoteLikeFactory } from "@/_shared/factories/like";
import { LocalNoteFactory, RemoteNoteFactory } from "@/_shared/factories/note";
import { server } from "@/_shared/mocks/server";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";
import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

describe("LikeButton/action", () => {
  test("ローカルのノートにいいねして、いいね数を更新できる", async () => {
    // arrange
    const user = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const note = await LocalNoteFactory.create();
    // act
    await action({ noteId: note.id, content: "👍" });
    // assert
    expect(await prisma.like.findFirst()).toEqualPrisma({
      id: expect.any(String),
      userId: user.id,
      noteId: note.id,
      content: "👍",
      createdAt: expect.anyDate(),
    });
    expect(
      await prisma.note.findUnique({ where: { id: note.id } }),
    ).toMatchObject({
      likesCount: 1,
    });
  });
  test("リモートのノートにいいねして、いいね数を更新できる", async () => {
    // arrange
    const user = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const note = await prisma.note.create({
      data: await RemoteNoteFactory.build(),
      include: {
        user: true,
      },
    });
    assert(note.user.inboxUrl);
    const inboxFn = jest.fn();
    server.use(
      http.post(note.user.inboxUrl, async ({ request }) => {
        inboxFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await action({ noteId: note.id, content: "👍" });
    // assert
    expect(await prisma.like.findFirst()).toEqualPrisma({
      id: expect.any(String),
      userId: user.id,
      noteId: note.id,
      content: "👍",
      createdAt: expect.anyDate(),
    });
    expect(inboxFn).toHaveBeenCalledTimes(1);
    expect(
      await prisma.note.findUnique({ where: { id: note.id } }),
    ).toMatchObject({
      likesCount: 1,
    });
  });
  test("ローカルのノートへのいいねを取り消して、いいね数を更新できる", async () => {
    // arrange
    const user = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const like = await LikeFactory.create({
      user: {
        connect: {
          id: user.id,
        },
      },
    });
    await prisma.note.update({
      where: { id: like.noteId },
      data: {
        likesCount: 1,
      },
    });
    // act
    await action({ noteId: like.noteId, content: "👍" });
    // assert
    expect(await prisma.like.findFirst()).toBeNull();
    expect(
      await prisma.note.findUnique({ where: { id: like.noteId } }),
    ).toMatchObject({
      likesCount: 0,
    });
  });
  test("リモートのノートへのいいねを取り消して、いいね数を更新できる", async () => {
    // arrange
    const user = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const like = await prisma.like.create({
      data: await RemoteLikeFactory.build({
        user: {
          connect: {
            id: user.id,
          },
        },
      }),
      include: { note: { include: { user: true } } },
    });
    assert(like.note.user.inboxUrl);
    await prisma.note.update({
      where: { id: like.noteId },
      data: {
        likesCount: 1,
      },
    });
    const inboxFn = jest.fn();
    server.use(
      http.post(like.note.user.inboxUrl, async ({ request }) => {
        inboxFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await action({ noteId: like.noteId, content: "👍" });
    // assert
    expect(await prisma.like.findFirst()).toBeNull();
    expect(inboxFn).toHaveBeenCalledTimes(1);
    expect(
      await prisma.note.findUnique({ where: { id: like.noteId } }),
    ).toMatchObject({
      likesCount: 0,
    });
  });
});
