import type { User } from "@prisma/client";
import assert from "assert";
import { http, HttpResponse } from "msw";

import { LocalUserFactory, RemoteUserFactory } from "@/_shared/factories/user";
import { mockedLogger } from "@/_shared/mocks/logger";
import { server } from "@/_shared/mocks/server";
import { FetcherError } from "@/_shared/utils/fetcher";

import { UserNotFoundError } from "./errors";
import { findOrFetchUserById } from "./userId";

jest.useFakeTimers();
const mockedNow = new Date("2024-01-01T03:00:00Z");
jest.setSystemTime(mockedNow);

const activiey = (remoteUser: User) => {
  return {
    type: "Person",
    id: remoteUser.actorUrl,
    preferredUsername: remoteUser.preferredUsername,
    inbox: remoteUser.inboxUrl,
    publicKey: {
      publicKeyPem: remoteUser.publicKey,
    },
  };
};

describe("findOrFetchUserById", () => {
  test("指定したIDのユーザーがDBに存在しない場合はエラーを返す", async () => {
    // arrange
    const user = await findOrFetchUserById("not-found-user-id");
    // act
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      "指定したIDのユーザーが見つかりませんでした",
      { id: "not-found-user-id" },
    );
    expect(user).toBeInstanceOf(UserNotFoundError);
  });
  test("指定したIDのローカルユーザーがDBに存在する場合はそのまま返す", async () => {
    // arrange
    const localUser = await LocalUserFactory.create();
    // act
    const user = await findOrFetchUserById(localUser.id);
    // assert
    expect(user).toEqual(localUser);
  });
  test("指定したIDのリモートユーザーがDBに存在し、最近fetchしたならそのまま返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create({
      // 2時間59分59秒前
      lastFetchedAt: new Date("2024-01-01T00:00:01Z"),
    });
    // act
    const user = await findOrFetchUserById(remoteUser.id);
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    expect(user).toEqual(remoteUser);
  });
  test("指定したIDのリモートユーザーがDBに存在し、最近fetchしていない場合はfetchして更新したうえで返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create({
      // 3時間前
      lastFetchedAt: new Date("2024-01-01T00:00:00Z"),
    });
    assert(remoteUser.actorUrl);
    server.use(
      http.get(remoteUser.actorUrl, () => {
        return HttpResponse.json(activiey(remoteUser));
      }),
    );
    // act
    const user = await findOrFetchUserById(remoteUser.id);
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    expect(user).toEqualPrisma({
      ...remoteUser,
      lastFetchedAt: mockedNow,
    });
  });
  test("同時に呼び出してもユーザー作成が重複してエラーにならない", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create({
      // 3時間前
      lastFetchedAt: new Date("2024-01-01T00:00:00Z"),
    });
    assert(remoteUser.actorUrl);
    server.use(
      http.get(remoteUser.actorUrl, () => {
        return HttpResponse.json(activiey(remoteUser));
      }),
    );
    // act
    const [user1, user2] = await Promise.all([
      findOrFetchUserById(remoteUser.id),
      findOrFetchUserById(remoteUser.id),
    ]);
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    expect(user1).toEqualPrisma({
      ...remoteUser,
      lastFetchedAt: mockedNow,
    });
    expect(user2).toEqualPrisma({
      ...remoteUser,
      lastFetchedAt: mockedNow,
    });
  });
  test("指定したIDのリモートユーザーがDBに存在し、fetchに失敗した場合はそのまま返す", async () => {
    // arrange
    const remoteUser = await RemoteUserFactory.create();
    assert(remoteUser.actorUrl);
    server.use(
      http.get(remoteUser.actorUrl, () => {
        return HttpResponse.error();
      }),
    );
    // act
    const user = await findOrFetchUserById(remoteUser.id);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      "リモートユーザーの更新に失敗しました",
      {
        actorUrl: remoteUser.actorUrl,
        error: new FetcherError("Failed to fetch"),
      },
    );
    expect(user).toEqual(remoteUser);
  });
});
