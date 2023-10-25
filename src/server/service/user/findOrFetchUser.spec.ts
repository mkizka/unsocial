import type { User } from "@prisma/client";
import { http, HttpResponse } from "msw";

import { mockedPrisma } from "@/mocks/prisma";
import { server } from "@/mocks/server";
import { NotOKError } from "@/utils/fetcher";

import {
  ActorValidationError,
  UserNotFoundError,
  WebfingerValidationError,
} from "./errors";
import {
  findOrFetchUserByActor,
  findOrFetchUserById,
  findOrFetchUserByWebFinger,
  shouldRefetch,
} from "./findOrFetchUser";

const mockedNow = new Date("2023-01-01T12:00:00Z");

const dummyUser = {
  id: "dummyId",
  preferredUsername: "dummy",
  host: "remote.example.com",
  icon: null,
  name: null,
  publicKey: "dummyPublicKey",
  actorUrl: "https://remote.example.com/u/dummyUser",
  inboxUrl: "https://remote.example.com/u/dummyUser/inbox",
};

const dummyCreatedUser = {
  ...dummyUser,
  name: "新しいユーザー",
  lastFetchedAt: mockedNow, // 新規作成した
};

const dummyUpdatedUser = {
  ...dummyUser,
  name: "更新したユーザー",
  lastFetchedAt: mockedNow, // 更新した
};

const dummyRecentUser = {
  ...dummyUser,
  name: "最近のユーザー",
  lastFetchedAt: new Date("2023-01-01T09:01:00Z"), // 2時間59分前に取得した
};

const dummyOldUser = {
  ...dummyUser,
  name: "古いユーザー",
  lastFetchedAt: new Date("2023-01-01T09:00:00Z"), // 3時間前に取得した
};

const dummyRefetchUser = {
  ...dummyUser,
  name: "fetch要求があったユーザー",
  lastFetchedAt: null,
};

const dummyWebfingerUrl = "https://remote.example.com/.well-known/webfinger";

const restSuccessWebfinger = http.get(dummyWebfingerUrl, ({ request }) => {
  if (
    new URL(request.url).searchParams.get("resource") !==
    "acct:dummy@remote.example.com"
  ) {
    return new HttpResponse(null, { status: 404 });
  }
  return HttpResponse.json({
    links: [
      { rel: "dummy" },
      {
        rel: "self",
        href: "https://remote.example.com/u/dummyUser",
      },
    ],
  });
});

const restInvalidWebfinger = http.get(dummyWebfingerUrl, () =>
  HttpResponse.json({ links: [{ foo: "bar" }] }),
);

const rest404Webgfinger = http.get(
  dummyWebfingerUrl,
  () => new HttpResponse(null, { status: 404 }),
);

const restSuccessActor = http.get(dummyUser.actorUrl, () =>
  HttpResponse.json({
    type: "Person",
    id: dummyUser.actorUrl,
    name: dummyCreatedUser.name,
    preferredUsername: dummyUser.preferredUsername,
    inbox: `${dummyUser.actorUrl}/inbox`,
    publicKey: {
      publicKeyPem: dummyUser.publicKey,
    },
  }),
);

const restInvalidActor = http.get(dummyUser.actorUrl, () =>
  HttpResponse.json({ type: "Invalid" }),
);

const rest404Actor = http.get(
  dummyUser.actorUrl,
  () => new HttpResponse(null, { status: 404 }),
);

const mockUser = (user: User | null) => {
  if (user?.actorUrl) {
    mockedPrisma.user.findUnique
      .calledWith(
        expect.objectContaining({
          where: {
            actorUrl: user.actorUrl,
          },
        }),
      )
      .mockResolvedValue(user);
  }
  if (user) {
    mockedPrisma.user.findUnique
      .calledWith(
        expect.objectContaining({
          where: {
            id: user.id,
          },
        }),
      )
      .mockResolvedValue(user);
    mockedPrisma.user.findUnique
      .calledWith(
        expect.objectContaining({
          where: {
            preferredUsername_host: {
              preferredUsername: user.preferredUsername,
              host: user.host,
            },
          },
        }),
      )
      .mockResolvedValue(user);
  }
  mockedPrisma.user.create.mockResolvedValue(
    dummyCreatedUser as unknown as User,
  );
  mockedPrisma.user.update.mockResolvedValue(
    dummyUpdatedUser as unknown as User,
  );
};

const ById = () => findOrFetchUserById(dummyUser.id);

const ByActor = () => findOrFetchUserByActor(dummyUser.actorUrl);

const ByWebFinger = () =>
  findOrFetchUserByWebFinger({
    preferredUsername: dummyUser.preferredUsername,
    host: dummyUser.host,
  });

const ByWebFinger__hostが自ホスト = () =>
  findOrFetchUserByWebFinger({
    preferredUsername: dummyUser.preferredUsername,
    host: "myhost.example.com",
  });

const 情報の新しいユーザーがDBに存在する = () =>
  mockUser(dummyRecentUser as unknown as User);

const 情報の古いユーザーがDBに存在する = () =>
  mockUser(dummyOldUser as unknown as User);

const ユーザーがDBに存在しない = () => mockUser(null);

const 他サーバーからユーザー取得に成功した = () => {
  server.use(restSuccessWebfinger, restSuccessActor);
};

const WebFingerとの通信に失敗した = () => {
  server.use(rest404Webgfinger, restSuccessActor);
};

const WebFingerのレスポンスが不正 = () => {
  server.use(restInvalidWebfinger, restSuccessActor);
};

const ActorURLとの通信に失敗した = () => {
  server.use(restSuccessWebfinger, rest404Actor);
};

const ActorURLのレスポンスが不正 = () => {
  server.use(restSuccessWebfinger, restInvalidActor);
};

const 通信しない = () => {
  server.use(rest404Webgfinger, rest404Actor);
};

describe("findOrFetchUser", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockedNow);
  });
  test.each`
    user                | expected
    ${dummyRefetchUser} | ${true}
    ${dummyOldUser}     | ${true}
    ${dummyRecentUser}  | ${false}
  `(
    "shouldRefetch: $user.nameのとき、$expectedを返す",
    ({ user, expected }) => {
      expect(shouldRefetch(user)).toBe(expected);
    },
  );
  test.each`
    sut                            | dbCondition                           | serverCondition                         | expected
    ${ById}                        | ${ユーザーがDBに存在しない}           | ${通信しない}                           | ${UserNotFoundError}
    ${ById}                        | ${情報の古いユーザーがDBに存在する}   | ${ActorURLとの通信に失敗した}           | ${dummyOldUser}
    ${ById}                        | ${情報の古いユーザーがDBに存在する}   | ${ActorURLのレスポンスが不正}           | ${dummyOldUser}
    ${ById}                        | ${情報の古いユーザーがDBに存在する}   | ${他サーバーからユーザー取得に成功した} | ${dummyUpdatedUser}
    ${ByActor}                     | ${ユーザーがDBに存在しない}           | ${ActorURLとの通信に失敗した}           | ${NotOKError}
    ${ByActor}                     | ${ユーザーがDBに存在しない}           | ${ActorURLのレスポンスが不正}           | ${ActorValidationError}
    ${ByActor}                     | ${ユーザーがDBに存在しない}           | ${他サーバーからユーザー取得に成功した} | ${dummyCreatedUser}
    ${ByActor}                     | ${情報の古いユーザーがDBに存在する}   | ${ActorURLとの通信に失敗した}           | ${dummyOldUser}
    ${ByActor}                     | ${情報の古いユーザーがDBに存在する}   | ${ActorURLのレスポンスが不正}           | ${dummyOldUser}
    ${ByActor}                     | ${情報の古いユーザーがDBに存在する}   | ${他サーバーからユーザー取得に成功した} | ${dummyUpdatedUser}
    ${ByActor}                     | ${情報の新しいユーザーがDBに存在する} | ${通信しない}                           | ${dummyRecentUser}
    ${ByWebFinger}                 | ${ユーザーがDBに存在しない}           | ${WebFingerとの通信に失敗した}          | ${NotOKError}
    ${ByWebFinger}                 | ${ユーザーがDBに存在しない}           | ${WebFingerのレスポンスが不正}          | ${WebfingerValidationError}
    ${ByWebFinger}                 | ${ユーザーがDBに存在しない}           | ${ActorURLとの通信に失敗した}           | ${NotOKError}
    ${ByWebFinger}                 | ${ユーザーがDBに存在しない}           | ${ActorURLのレスポンスが不正}           | ${ActorValidationError}
    ${ByWebFinger}                 | ${ユーザーがDBに存在しない}           | ${他サーバーからユーザー取得に成功した} | ${dummyCreatedUser}
    ${ByWebFinger}                 | ${情報の古いユーザーがDBに存在する}   | ${WebFingerとの通信に失敗した}          | ${dummyOldUser}
    ${ByWebFinger}                 | ${情報の古いユーザーがDBに存在する}   | ${WebFingerのレスポンスが不正}          | ${dummyOldUser}
    ${ByWebFinger}                 | ${情報の古いユーザーがDBに存在する}   | ${ActorURLとの通信に失敗した}           | ${dummyOldUser}
    ${ByWebFinger}                 | ${情報の古いユーザーがDBに存在する}   | ${ActorURLのレスポンスが不正}           | ${dummyOldUser}
    ${ByWebFinger}                 | ${情報の古いユーザーがDBに存在する}   | ${他サーバーからユーザー取得に成功した} | ${dummyUpdatedUser}
    ${ByWebFinger}                 | ${情報の新しいユーザーがDBに存在する} | ${通信しない}                           | ${dummyRecentUser}
    ${ByWebFinger__hostが自ホスト} | ${ユーザーがDBに存在しない}           | ${通信しない}                           | ${UserNotFoundError}
  `(
    "findOrFetchUser$sut.name: $dbCondition.name、$serverCondition.nameとき、$expected.nameを返す",
    async ({ sut, dbCondition, serverCondition, expected }) => {
      // arrange
      dbCondition();
      serverCondition();
      // act
      const user = await sut();
      // assert
      if (typeof expected === "function") {
        expect(user).toBeInstanceOf(expected);
      } else {
        expect(user).toEqual(expected);
      }
    },
  );
  test("findOrFetchUserByActor: 引数のドメインが自ホストの場合は、IDをパースしてユーザーを返す", async () => {
    // arrange
    const dummyLocalUser = {
      id: "dummyLocalId",
      host: "myhost.example.com",
      actorUrl: "https://myhost.example.com/users/dummyLocalId/activity",
    };
    mockUser(dummyLocalUser as unknown as User);
    // ローカルユーザーなのに自ホストのアドレスを叩かないようにする
    const localServerHandler = jest.fn();
    server.use(
      http.get(/https:\/\/myhost\.example\.com\/.*/, () => {
        localServerHandler();
        return new HttpResponse(null, { status: 404 });
      }),
    );
    // act
    const result = await findOrFetchUserByActor(dummyLocalUser.actorUrl);
    // assert
    expect(result).toEqual(dummyLocalUser);
    expect(localServerHandler).not.toHaveBeenCalled();
  });
});
