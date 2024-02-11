import assert from "assert";
import { http, HttpResponse } from "msw";

import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { FollowFactory } from "@/_shared/factories/follow";
import { RemoteUserFactory } from "@/_shared/factories/user";
import { server } from "@/_shared/mocks/server";
import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

import { apRelayService } from ".";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-01T00:00:00Z"));

jest.mock("@/../package.json", () => ({
  version: "1.2.3",
}));

describe("apRelayService", () => {
  test("activityのccに指定された各actorのinboxをDBから引いて配送する", async () => {
    // arrange
    const { id: userId } = await userSignUpService.signUpUser({
      preferredUsername: "user",
      password: "password",
    });
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.inboxUrl);
    const activity = {
      type: "Announce",
      cc: [remoteUser.actorUrl],
    } as unknown as apSchemaService.Activity;
    const ccFn = jest.fn();
    server.use(
      http.post(remoteUser.inboxUrl, async ({ request }) => {
        ccFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await apRelayService.relay({
      userId,
      activity,
    });
    // assert
    expect(ccFn).toHaveBeenCalledTimes(1);
    expect(ccFn).toHaveBeenCalledWith(activity);
  });
  test("UndoのActivityならのobjectに指定されたccを使って配送する", async () => {
    // arrange
    const { id: userId } = await userSignUpService.signUpUser({
      preferredUsername: "user",
      password: "password",
    });
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.inboxUrl);
    const activity = {
      type: "Undo",
      object: {
        type: "Dummy",
        cc: [remoteUser.actorUrl],
      },
    } as unknown as apSchemaService.Activity;
    const ccFn = jest.fn();
    server.use(
      http.post(remoteUser.inboxUrl, async ({ request }) => {
        ccFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await apRelayService.relay({
      userId,
      activity,
    });
    // assert
    expect(ccFn).toHaveBeenCalledTimes(1);
    expect(ccFn).toHaveBeenCalledWith(activity);
  });
  test("ccにフォロワーのURLを指定した場合はフォロワーのinboxに展開し、重複を排除して配送する", async () => {
    // arrange
    const { id: userId } = await userSignUpService.signUpUser({
      preferredUsername: "user",
      password: "password",
    });
    const [data1, data2] = await FollowFactory.buildList([
      // CCでも指定するフォロワー
      {
        followee: {
          connect: {
            id: userId,
          },
        },
      },
      // その他のフォロワー
      {
        followee: {
          connect: {
            id: userId,
          },
        },
      },
    ]);
    const follow1 = await prisma.follow.create({
      data: data1!,
      include: { follower: true },
    });
    const follow2 = await prisma.follow.create({
      data: data2!,
      include: { follower: true },
    });
    assert(follow1.follower.inboxUrl);
    assert(follow2.follower.inboxUrl);
    const activity = {
      type: "Dummy",
      cc: [
        follow1.follower.actorUrl, // フォロワー1のURLをccに指定しても2回配送しないことを検証
        `https://${env.UNSOCIAL_HOST}/users/${userId}/followers`,
      ],
    } as unknown as apSchemaService.Activity;
    const follower1Fn = jest.fn();
    const follower2Fn = jest.fn();
    server.use(
      http.post(follow1.follower.inboxUrl, async ({ request }) => {
        follower1Fn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
      http.post(follow2.follower.inboxUrl, async ({ request }) => {
        follower2Fn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await apRelayService.relay({
      userId,
      activity,
    });
    // assert
    expect(follower1Fn).toHaveBeenCalledTimes(1);
    expect(follower1Fn).toHaveBeenCalledWith(activity);
    expect(follower2Fn).toHaveBeenCalledTimes(1);
    expect(follower2Fn).toHaveBeenCalledWith(activity);
  });
  test("ccの指定が無ければフォロワーに配送する", async () => {
    // arrange
    const { id: userId } = await userSignUpService.signUpUser({
      preferredUsername: "user",
      password: "password",
    });
    const data = await FollowFactory.build({
      followee: {
        connect: {
          id: userId,
        },
      },
    });
    const follow = await prisma.follow.create({
      data: data,
      include: { follower: true },
    });
    assert(follow.follower.inboxUrl);
    const activity = {
      type: "Dummy",
    } as unknown as apSchemaService.Activity;
    const followerFn = jest.fn();
    server.use(
      http.post(follow.follower.inboxUrl, async ({ request }) => {
        followerFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await apRelayService.relay({
      userId,
      activity,
    });
    // assert
    expect(followerFn).toHaveBeenCalledTimes(1);
    expect(followerFn).toHaveBeenCalledWith(activity);
  });
});
