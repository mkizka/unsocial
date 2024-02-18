import { http, HttpResponse } from "msw";

import { RemoteUserFactory } from "@/_shared/factories/user";
import { mockedLogger } from "@/_shared/mocks/logger";
import { server } from "@/_shared/mocks/server";
import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { prisma } from "@/_shared/utils/prisma";

import { handle } from "./follow";

describe("inboxFollowService", () => {
  test("正常系", async () => {
    // arrange
    const localUser = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    const remoteUser = await RemoteUserFactory.create();
    const activity = {
      type: "Follow",
      id: "https://remote.example.com/follows/foobar",
      actor: remoteUser.actorUrl!,
      object: `https://myhost.example.com/users/${localUser.id}/activity`,
    };
    const remoteUserFn = jest.fn();
    server.use(
      http.post(remoteUser.inboxUrl!, async ({ request }) => {
        remoteUserFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeUndefined();
    expect(await prisma.follow.findFirst()).toEqualPrisma({
      id: expect.any(String),
      followeeId: localUser.id,
      followerId: remoteUser.id,
      status: "ACCEPTED",
      createdAt: expect.anyDate(),
    });
    expect(remoteUserFn).toHaveBeenCalledTimes(1);
  });
  test("同じフォロー関係が送られてきてもエラーにしない", async () => {
    // arrange
    const localUser = await userSignUpService.signUpUser({
      preferredUsername: "test",
      password: "password",
    });
    const remoteUser = await RemoteUserFactory.create();
    await prisma.follow.create({
      data: {
        followeeId: localUser.id,
        followerId: remoteUser.id,
      },
    });
    const activity = {
      type: "Follow",
      id: "https://remote.example.com/follows/foobar",
      actor: remoteUser.actorUrl!,
      object: `https://myhost.example.com/users/${localUser.id}/activity`,
    };
    const remoteUserFn = jest.fn();
    server.use(
      http.post(remoteUser.inboxUrl!, async ({ request }) => {
        remoteUserFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    const error = await handle(activity, remoteUser);
    // assert
    expect(error).toBeUndefined();
    expect(mockedLogger.info).toHaveBeenCalledWith(
      `すでに存在するフォロー関係のためスキップ`,
    );
    expect(remoteUserFn).not.toHaveBeenCalled();
  });
});
