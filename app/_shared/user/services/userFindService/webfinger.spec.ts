import { http, HttpResponse } from "msw";

import { LocalUserFactory } from "@/_shared/factories/user";
import { mockedLogger } from "@/_shared/mocks/logger";
import { server } from "@/_shared/mocks/server";
import { FetcherError } from "@/_shared/utils/fetcher";
import { prisma } from "@/_shared/utils/prisma";

import { UserNotFoundError } from "./errors";
import { findOrFetchUserByWebFinger } from "./webfinger";

jest.useFakeTimers();
const mockedNow = new Date("2024-01-01T03:00:00Z");
jest.setSystemTime(mockedNow);

const actorUrl = "https://remote.example.com/users/remote-user-id/activity";

const webfingerUrl = "https://remote.example.com/.well-known/webfinger";

const mockWebfinger = http.get(webfingerUrl, ({ request }) => {
  if (
    new URL(request.url).searchParams.get("resource") ===
    "acct:remote@remote.example.com"
  ) {
    return HttpResponse.json({
      links: [{ rel: "self", href: actorUrl }],
    });
  }
  return HttpResponse.json();
});

const mockWebfingerError = http.get(webfingerUrl, () => HttpResponse.error());

const activity = {
  type: "Person",
  id: actorUrl,
  preferredUsername: "remote",
  inbox: "https://remote.example.com/inbox",
  publicKey: {
    publicKeyPem: "remote-public-key",
  },
};

const mockActor = http.get(actorUrl, () => HttpResponse.json(activity));

const mockActorError = http.get(actorUrl, () => HttpResponse.error());

describe("fetchActorUrlByWebFinger", () => {
  test("指定したpreferredUsernameとhostのローカルユーザーが存在しない場合はエラーを返す", async () => {
    // act
    const user = await findOrFetchUserByWebFinger({
      preferredUsername: "not-found-user-id",
      host: "myhost.example.com",
    });
    // assert
    expect(user).toBeInstanceOf(UserNotFoundError);
  });
  test("指定したpreferredUsernameとhostのローカルユーザーが存在する場合はそのまま返す", async () => {
    // arrange
    const localUser = await LocalUserFactory.create();
    // act
    const user = await findOrFetchUserByWebFinger({
      preferredUsername: localUser.preferredUsername,
      host: localUser.host,
    });
    // assert
    expect(mockedLogger.warn).not.toHaveBeenCalled();
    expect(user).toEqualPrisma(localUser);
  });
  test("指定したpreferredUsernameとhostのリモートユーザーがDBに存在しない場合はWebfingerから取得して返す", async () => {
    // arrange
    server.use(mockWebfinger, mockActor);
    // act
    const user = await findOrFetchUserByWebFinger({
      preferredUsername: "remote",
      host: "remote.example.com",
    });
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
  test("指定したpreferredUsernameとhostのリモートユーザーがDBに存在せず、Webfingerとの通信に失敗した場合はエラーを返す", async () => {
    // arrange
    server.use(mockWebfingerError);
    const params = {
      preferredUsername: "remote",
      host: "remote.example.com",
    };
    // act
    const user = await findOrFetchUserByWebFinger(params);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      "WebfingerからActorURLの取得に失敗しました",
      {
        user: params,
        error: new Error("Failed to fetch"),
      },
    );
    expect(user).toBeInstanceOf(Error);
  });
  test("指定したpreferredUsernameとhostのリモートユーザーがDBに存在せず、fetchに失敗した場合はエラーを返す", async () => {
    // arrange
    server.use(mockWebfinger, mockActorError);
    const params = {
      preferredUsername: "remote",
      host: "remote.example.com",
    };
    // act
    const user = await findOrFetchUserByWebFinger(params);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledTimes(1);
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      "Actorの取得に失敗しました",
      {
        actorUrl,
        error: new FetcherError("Failed to fetch"),
      },
    );
    expect(user).toBeInstanceOf(Error);
  });
});
