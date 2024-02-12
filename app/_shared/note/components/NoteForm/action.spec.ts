import assert from "assert";
import { http, HttpResponse } from "msw";

import { FollowFactory } from "@/_shared/factories/follow";
import { RemoteNoteFactory } from "@/_shared/factories/note";
import { server } from "@/_shared/mocks/server";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";
import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

jest.useFakeTimers();
jest.setSystemTime(new Date("2024-01-01T00:00:00Z"));

describe("NoteForm/action", () => {
  test("ノートを作成してフォロワーに配送する", async () => {
    // arrange
    const user = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const follow = await prisma.follow.create({
      data: await FollowFactory.build({
        followee: {
          connect: {
            id: user.id,
          },
        },
      }),
      include: { follower: true },
    });
    assert(follow.follower.inboxUrl);
    const followerFn = jest.fn();
    server.use(
      http.post(follow.follower.inboxUrl, async ({ request }) => {
        followerFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    const form = new FormData();
    form.append("content", "テスト");
    const response = await action(form);
    // assert
    expect(response).toBeUndefined();
    expect(await prisma.note.findFirst()).toEqualPrisma({
      id: expect.any(String),
      userId: user.id,
      url: null,
      quoteId: null,
      replyToId: null,
      content: "テスト",
      createdAt: expect.anyDate(),
      publishedAt: new Date("2024-01-01T00:00:00Z"),
    });
    expect(followerFn).toHaveBeenCalledTimes(1);
  });
  test("リプライIDが指定されていた場合はフォロワーとリプライ先に配送する", async () => {
    // arrange
    const user = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const replyTo = await prisma.note.create({
      data: await RemoteNoteFactory.build(),
      include: { user: true },
    });
    assert(replyTo.user.inboxUrl);
    const follow = await prisma.follow.create({
      data: await FollowFactory.build({
        followee: {
          connect: {
            id: user.id,
          },
        },
      }),
      include: { follower: true },
    });
    assert(follow.follower.inboxUrl);
    const followerFn = jest.fn();
    const replyToFn = jest.fn();
    server.use(
      http.post(follow.follower.inboxUrl, async ({ request }) => {
        followerFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
      http.post(replyTo.user.inboxUrl, async ({ request }) => {
        replyToFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    const form = new FormData();
    form.append("content", "テスト");
    form.append("replyToId", replyTo.id);
    const response = await action(form);
    // assert
    expect(response).toBeUndefined();
    expect(
      await prisma.note.findFirst({
        where: {
          userId: user.id,
        },
      }),
    ).toEqualPrisma({
      id: expect.any(String),
      userId: user.id,
      url: null,
      quoteId: null,
      replyToId: replyTo.id,
      content: "テスト",
      createdAt: expect.anyDate(),
      publishedAt: new Date("2024-01-01T00:00:00Z"),
    });
    expect(followerFn).toHaveBeenCalledTimes(1);
    expect(replyToFn).toHaveBeenCalledTimes(1);
  });
  test("入力したデータが不正な場合はエラーを返す", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue("dummy");
    // act
    const form = new FormData();
    const response = await action(form);
    // assert
    expect(response).toEqual({ error: "フォームの内容が不正です" });
  });
});
