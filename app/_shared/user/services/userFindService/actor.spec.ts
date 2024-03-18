import assert from "assert";
import { http, HttpResponse } from "msw";

import { LocalUserFactory, RemoteUserFactory } from "@/_shared/factories/user";
import { mockedLogger } from "@/_shared/mocks/logger";
import { server } from "@/_shared/mocks/server";
import { FetcherError } from "@/_shared/utils/fetcher";
import { prisma } from "@/_shared/utils/prisma";

import { findOrFetchUserByActor } from "./actor";
import { UserNotFoundError } from "./errors";

jest.useFakeTimers();
const mockedNow = new Date("2024-01-01T03:00:00Z");
jest.setSystemTime(mockedNow);

describe("findOrFetchUserByActor", () => {
  test("指定したactorUrlのローカルユーザーがDBに存在しない場合はエラーを返す", async () => {
    // arrange
    const user = await findOrFetchUserByActor(
      "https://myhost.example.com/users/not-found-user-id/activity",
    );
    // act
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      "指定したIDのユーザーが見つかりませんでした",
      { id: "not-found-user-id" },
    );
    expect(user).toBeInstanceOf(UserNotFoundError);
  });
  test("指定したactorUrlのローカルユーザーがDBに存在する場合はそのまま返す", async () => {
    // arrange
    const localUser = await LocalUserFactory.create();
    // act
    const user = await findOrFetchUserByActor(
      `https://myhost.example.com/users/${localUser.id}/activity`,
    );
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    expect(user).toEqual(localUser);
  });
  test("指定したactorUrlのリモートユーザーがDBに存在し、最近fetchしたならそのまま返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create({
      // 2時間59分59秒前
      lastFetchedAt: new Date("2024-01-01T00:00:01Z"),
    });
    assert(remoteUser.actorUrl);
    // act
    const user = await findOrFetchUserByActor(remoteUser.actorUrl);
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    expect(user).toEqual(remoteUser);
  });
  test("指定したactorUrlのリモートユーザーがDBに存在し、最近fetchしていない場合はfetchして更新したうえで返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create({
      // 3時間前
      lastFetchedAt: new Date("2024-01-01T00:00:00Z"),
    });
    assert(remoteUser.actorUrl);
    server.use(
      http.get(remoteUser.actorUrl, () => {
        return HttpResponse.json({
          type: "Person",
          id: remoteUser.actorUrl,
          preferredUsername: remoteUser.preferredUsername,
          inbox: remoteUser.inboxUrl,
          publicKey: {
            publicKeyPem: remoteUser.publicKey,
          },
        });
      }),
    );
    // act
    const user = await findOrFetchUserByActor(remoteUser.actorUrl);
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    expect(user).toEqualPrisma({
      ...remoteUser,
      lastFetchedAt: mockedNow,
    });
  });
  test("指定したactorUrlのリモートユーザーがDBに存在し、fetchに失敗した場合はそのまま返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.actorUrl);
    server.use(
      http.get(remoteUser.actorUrl, () => {
        return HttpResponse.error();
      }),
    );
    // act
    const user = await findOrFetchUserByActor(remoteUser.actorUrl);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      "Actorの取得に失敗しました",
      {
        actorUrl: remoteUser.actorUrl,
        error: new FetcherError("Failed to fetch"),
      },
    );
    expect(user).toEqual(remoteUser);
  });
  test("指定したactorUrlのリモートユーザーがDBに存在し、fetchが410エラーの場合はログを出さずそのまま返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.actorUrl);
    server.use(
      http.get(remoteUser.actorUrl, () => {
        return HttpResponse.text("Gone", { status: 410 });
      }),
    );
    // act
    const user = await findOrFetchUserByActor(remoteUser.actorUrl);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledTimes(0);
    expect(user).toEqual(remoteUser);
  });
  test("指定したactorUrlのリモートユーザーがDBに存在せず、fetchに成功した場合はDBに追加して返す", async () => {
    // arrange
    const actorUrl = "https://remote.example.com/users/remote-user-id/activity";
    const activity = {
      type: "Person",
      id: actorUrl,
      preferredUsername: "remote",
      inbox: "https://remote.example.com/inbox",
      publicKey: {
        publicKeyPem: "remote-public-key",
      },
    };
    server.use(
      http.get(actorUrl, () => {
        return HttpResponse.json(activity);
      }),
    );
    // act
    const user = await findOrFetchUserByActor(actorUrl);
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    const expected = expect.objectContaining({
      preferredUsername: activity.preferredUsername,
      host: "remote.example.com",
      actorUrl,
      inboxUrl: activity.inbox,
      publicKey: activity.publicKey.publicKeyPem,
      lastFetchedAt: mockedNow,
    });
    expect(user).toEqualPrisma(expected);
    expect(
      await prisma.user.findUnique({
        where: { actorUrl },
      }),
    ).toEqualPrisma(expected);
  });
  test("同時に呼び出してもユーザー作成が重複してエラーにならない", async () => {
    // arrange
    const actorUrl = "https://remote.example.com/users/remote-user-id/activity";
    const activity = {
      type: "Person",
      id: actorUrl,
      preferredUsername: "remote",
      inbox: "https://remote.example.com/inbox",
      publicKey: {
        publicKeyPem: "remote-public-key",
      },
    };
    server.use(
      http.get(actorUrl, () => {
        return HttpResponse.json(activity);
      }),
    );
    // act
    const [user1, user2] = await Promise.all([
      findOrFetchUserByActor(actorUrl),
      findOrFetchUserByActor(actorUrl),
    ]);
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    const expected = expect.objectContaining({
      preferredUsername: activity.preferredUsername,
      host: "remote.example.com",
      actorUrl,
      inboxUrl: activity.inbox,
      publicKey: activity.publicKey.publicKeyPem,
      lastFetchedAt: mockedNow,
    });
    expect(user1).toEqualPrisma(expected);
    expect(user2).toEqualPrisma(expected);
    expect(
      await prisma.user.findUnique({
        where: { actorUrl },
      }),
    ).toEqualPrisma(expected);
  });
  test("指定したactorUrlのリモートユーザーがDBに存在せず、fetchに失敗した場合はエラーを返す", async () => {
    // arrange
    const actorUrl =
      "https://remote.example.com/users/not-found-user-id/activity";
    server.use(
      http.get(actorUrl, () => {
        return HttpResponse.error();
      }),
    );
    // act
    const user = await findOrFetchUserByActor(actorUrl);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      "Actorの取得に失敗しました",
      {
        actorUrl,
        error: new FetcherError("Failed to fetch"),
      },
    );
    expect(user).toBeInstanceOf(FetcherError);
  });
  test("actorUrlの指定がローカルかつ/usersで始まらない場合はエラーを返す", async () => {
    // arrange
    const actorUrl = "https://myhost.example.com/invalid-actor-url";
    // act
    const user = await findOrFetchUserByActor(actorUrl);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith("actorUrlの形式が不正です", {
      actorUrl,
    });
    expect(user).toBeInstanceOf(Error);
  });
  test("actorUrlの指定がローカルかつ/activityで終わらない場合はエラーを返す", async () => {
    // arrange
    const actorUrl = "https://myhost.example.com/users/invalid-actor-url";
    // act
    const user = await findOrFetchUserByActor(actorUrl);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith("actorUrlの形式が不正です", {
      actorUrl,
    });
    expect(user).toBeInstanceOf(Error);
  });
});
