import { http, HttpResponse } from "msw";

import { RemoteNoteFactory } from "@/_shared/factories/note";
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
  const repostedNote = await prisma.note.create({
    data: await RemoteNoteFactory.build(),
    include: { user: true },
  });
  await prisma.follow.create({
    data: {
      followeeId: user.id,
      followerId: repostedNote.user.id,
    },
  });
  return { user, follower, repostedNote };
};

describe("RepostButton/action", () => {
  test("ノートをリポスト出来る", async () => {
    // arrange
    const { repostedNote, user, follower } = await setup();
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const followerHandler = jest.fn();
    const repostedUserHandler = jest.fn();
    server.use(
      http.post(follower.inboxUrl!, () => {
        followerHandler();
        return HttpResponse.text("OK");
      }),
      http.post(repostedNote.user.inboxUrl!, () => {
        repostedUserHandler();
        return HttpResponse.text("OK");
      }),
    );
    // act
    await action({ noteId: repostedNote.id });
    // assert
    const noteWithQuote = await prisma.note.findFirst({
      where: {
        userId: user.id,
        quote: {
          id: repostedNote.id,
        },
      },
    });
    expect(noteWithQuote).not.toBeNull();
    expect(followerHandler).toHaveBeenCalledTimes(1);
    // TODO: 1回だけ呼ばれるようにする
    expect(repostedUserHandler).toHaveBeenCalledTimes(2);
  });
  test.skip("リポストしたノートを削除できる", async () => {
    // arrange
    const { repostedNote, user, follower } = await setup();
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const followerHandler = jest.fn();
    const repostedUserHandler = jest.fn();
    server.use(
      http.get(follower.inboxUrl!, () => {
        followerHandler();
        return HttpResponse.text("OK");
      }),
      http.get(repostedNote.user.inboxUrl!, () => {
        repostedUserHandler();
        return HttpResponse.text("OK");
      }),
    );
    await action({ noteId: repostedNote.id });
    // act
    await action({ noteId: repostedNote.id });
    // assert
    const noteWithQuote = await prisma.note.findFirst({
      where: {
        userId: user.id,
        quote: {
          id: repostedNote.id,
        },
      },
    });
    expect(noteWithQuote).toBeNull();
    expect(repostedUserHandler).toHaveBeenCalledTimes(2);
    expect(followerHandler).toHaveBeenCalledTimes(2);
  });
});
