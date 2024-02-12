import { http, HttpResponse } from "msw";

import { LocalUserFactory, RemoteUserFactory } from "@/_shared/factories/user";
import { server } from "@/_shared/mocks/server";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";
import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

jest.mock("next/cache");

describe("FollowButton/action", () => {
  test("ローカルのユーザーをフォローできる", async () => {
    // arrange
    const followee = await LocalUserFactory.create();
    const follower = await LocalUserFactory.create();
    mockedGetSessionUserId.mockResolvedValue(follower.id);
    // act
    await action({ followeeId: followee.id });
    // assert
    expect(await prisma.follow.findFirst()).toEqualPrisma({
      id: expect.any(String),
      followeeId: followee.id,
      followerId: follower.id,
      status: "ACCEPTED",
      createdAt: expect.anyDate(),
    });
  });
  test("リモートのユーザーをフォローできる", async () => {
    // arrange
    const localUser = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    mockedGetSessionUserId.mockResolvedValue(localUser.id);
    const remoteUser = await RemoteUserFactory.create();
    const remoteUserFn = jest.fn();
    server.use(
      http.post(remoteUser.inboxUrl!, async ({ request }) => {
        remoteUserFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await action({ followeeId: remoteUser.id });
    // assert
    expect(await prisma.follow.findFirst()).toEqualPrisma({
      id: expect.any(String),
      followeeId: remoteUser.id,
      followerId: localUser.id,
      status: "SENT",
      createdAt: expect.anyDate(),
    });
    expect(remoteUserFn).toHaveBeenCalledTimes(1);
    expect(remoteUserFn).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "Follow",
      }),
    );
  });
  test("ローカルのユーザーのフォローを解除できる", async () => {
    // arrange
    const followee = await LocalUserFactory.create();
    const follower = await LocalUserFactory.create();
    mockedGetSessionUserId.mockResolvedValue(follower.id);
    await prisma.follow.create({
      data: {
        followeeId: followee.id,
        followerId: follower.id,
      },
    });
    // act
    await action({ followeeId: followee.id });
    // assert
    expect(await prisma.follow.findFirst()).toBeNull();
  });
  test("リモートのユーザーのフォローを解除できる", async () => {
    // arrange
    const localUser = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    mockedGetSessionUserId.mockResolvedValue(localUser.id);
    const remoteUser = await RemoteUserFactory.create();
    await prisma.follow.create({
      data: {
        followeeId: remoteUser.id,
        followerId: localUser.id,
      },
    });
    const remoteUserFn = jest.fn();
    server.use(
      http.post(remoteUser.inboxUrl!, async ({ request }) => {
        remoteUserFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await action({ followeeId: remoteUser.id });
    // assert
    expect(await prisma.follow.findFirst()).toBeNull();
    expect(remoteUserFn).toHaveBeenCalledTimes(1);
    expect(remoteUserFn).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "Undo",
      }),
    );
  });
});
