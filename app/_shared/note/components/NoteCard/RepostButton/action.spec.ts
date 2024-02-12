import { http, HttpResponse } from "msw";

import { LocalNoteFactory, RemoteNoteFactory } from "@/_shared/factories/note";
import { RemoteUserFactory } from "@/_shared/factories/user";
import { server } from "@/_shared/mocks/server";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";
import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

const setup = async () => {
  const user = await userSignUpService.signUpUser({
    preferredUsername: "user",
    password: "password",
  });
  const follower = await RemoteUserFactory.create();
  await prisma.follow.create({
    data: {
      followeeId: user.id,
      followerId: follower.id,
    },
  });
  const noteToRepost = await prisma.note.create({
    data: await RemoteNoteFactory.build(),
    include: { user: true },
  });
  await prisma.follow.create({
    data: {
      followeeId: user.id,
      followerId: noteToRepost.user.id,
    },
  });
  return { user, follower, noteToRepost };
};

describe("RepostButton/action", () => {
  test("ノートをリポスト出来る", async () => {
    // arrange
    const { noteToRepost, user, follower } = await setup();
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const followerHandler = jest.fn();
    const repostedUserHandler = jest.fn();
    server.use(
      http.post(follower.inboxUrl!, () => {
        followerHandler();
        return HttpResponse.text("OK");
      }),
      http.post(noteToRepost.user.inboxUrl!, () => {
        repostedUserHandler();
        return HttpResponse.text("OK");
      }),
    );
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
    expect(followerHandler).toHaveBeenCalledTimes(1);
    expect(repostedUserHandler).toHaveBeenCalledTimes(1);
  });
  test("リポストしたノートを削除できる", async () => {
    // arrange
    const { noteToRepost, user, follower } = await setup();
    mockedGetSessionUserId.mockResolvedValue(user.id);
    await LocalNoteFactory.create({
      quote: {
        connect: { id: noteToRepost.id },
      },
      user: {
        connect: { id: user.id },
      },
    });
    const followerHandler = jest.fn();
    const repostedUserHandler = jest.fn();
    server.use(
      http.post(follower.inboxUrl!, () => {
        followerHandler();
        return HttpResponse.text("OK");
      }),
      http.post(noteToRepost.user.inboxUrl!, () => {
        repostedUserHandler();
        return HttpResponse.text("OK");
      }),
    );
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
    expect(followerHandler).toHaveBeenCalledTimes(1);
    expect(repostedUserHandler).toHaveBeenCalledTimes(1);
  });
});
