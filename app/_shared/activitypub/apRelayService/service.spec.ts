import assert from "assert";
import { http, HttpResponse } from "msw";

import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { FollowFactory } from "@/_shared/factories/follow";
import { server } from "@/_shared/mocks/server";
import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

import { apReplayService } from ".";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-01T00:00:00Z"));

jest.mock("@/../package.json", () => ({
  version: "1.2.3",
}));

describe("apRelayService", () => {
  test("inboxUrlで指定したURLにActivityを配送する", async () => {
    // arrange
    const { id: userId } = await userSignUpService.signUpUser({
      preferredUsername: "user",
      password: "password",
    });
    const inboxUrl = "https://remote.example.com/inbox";
    const activity = { type: "Dummy" } as unknown as apSchemaService.Activity;
    const requestBodyFn = jest.fn();
    server.use(
      http.post(inboxUrl, async ({ request }) => {
        requestBodyFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await apReplayService.relay({
      userId,
      activity,
      inboxUrl,
    });
    // assert
    expect(requestBodyFn).toHaveBeenCalledWith(activity);
  });
  test("activityにccが指定されている場合は指定された宛先にも配送する", async () => {
    // arrange
    const { id: userId } = await userSignUpService.signUpUser({
      preferredUsername: "user",
      password: "password",
    });
    const inboxUrl = "https://remote.example.com/inbox";
    const activity = {
      type: "Announce",
      cc: ["https://remote2.example.com/inbox"],
    } as unknown as apSchemaService.Activity;
    const inboxUrlFn = jest.fn();
    const ccFn = jest.fn();
    server.use(
      http.post(inboxUrl, async ({ request }) => {
        inboxUrlFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
      // @ts-ignore
      http.post(activity.cc[0], async ({ request }) => {
        ccFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await apReplayService.relay({
      userId,
      activity,
      inboxUrl,
    });
    // assert
    expect(inboxUrlFn).toHaveBeenCalledTimes(1);
    expect(inboxUrlFn).toHaveBeenCalledWith(activity);
    expect(ccFn).toHaveBeenCalledTimes(1);
    expect(ccFn).toHaveBeenCalledWith(activity);
  });
  test("フォロワーのURLも指定した場合は重複を排除してフォロワーに配送する", async () => {
    // arrange
    const { id: userId } = await userSignUpService.signUpUser({
      preferredUsername: "user",
      password: "password",
    });
    const [data1, data2] = await FollowFactory.buildList([
      {
        followee: {
          connect: {
            id: userId,
          },
        },
      },
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
        follow1.follower.inboxUrl, // フォロワー1のURLをccに指定しても2回配送しないことを検証
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
    await apReplayService.relay({
      userId,
      activity,
      inboxUrl: follow2.follower.inboxUrl, // フォロワー2のURLをinboxUrlに指定しても2回配送しないことを検証
    });
    // assert
    expect(follower1Fn).toHaveBeenCalledWith(activity);
    expect(follower2Fn).toHaveBeenCalledWith(activity);
  });
});
