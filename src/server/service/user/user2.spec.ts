import type { User } from "@prisma/client";
import { rest } from "msw";

import { mockedPrisma } from "@/mocks/prisma";
import { server } from "@/mocks/server";

import * as userService from "./service";

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

const dummyNewUser = {
  ...dummyUser,
  lastFetchedAt: mockedNow, // 新規作成した
};

const dummyRecentUser = {
  ...dummyUser,
  lastFetchedAt: new Date("2023-01-01T11:00:00Z"), // 1時間前に取得した
};

const dummyOldUser = {
  ...dummyUser,
  lastFetchedAt: new Date("2023-01-01T00:00:00Z"), // 12時間前に取得した
};

const { id: _id, ...expectedDataForPrismaCreateOrUpdate } = dummyNewUser;

const dummyPerson = {
  type: "Person",
  id: dummyUser.actorUrl,
  name: null,
  preferredUsername: dummyUser.preferredUsername,
  inbox: `${dummyUser.actorUrl}/inbox`,
  publicKey: {
    publicKeyPem: dummyUser.publicKey,
  },
};

const restSuccessWebfinger = rest.get(
  "https://remote.example.com/.well-known/webfinger",
  (req, res, ctx) => {
    if (
      req.url.searchParams.get("resource") !== "acct:dummy@remote.example.com"
    ) {
      return res(ctx.status(404));
    }
    return res(
      ctx.json({
        links: [
          { rel: "dummy", href: "https://example.com" },
          {
            rel: "self",
            href: "https://remote.example.com/u/dummyUser",
          },
        ],
      }),
    );
  },
);

const mockUser = (user: User | null) => {
  mockedPrisma.user.findFirst
    .calledWith(
      expect.objectContaining({
        where: {
          actorUrl: dummyUser.actorUrl,
        },
      }),
    )
    .mockResolvedValue(user);
  mockedPrisma.user.findFirst
    .calledWith(
      expect.objectContaining({
        where: {
          id: dummyUser.id,
        },
      }),
    )
    .mockResolvedValue(user);
  mockedPrisma.user.findFirst
    .calledWith(
      expect.objectContaining({
        where: {
          preferredUsername: dummyUser.preferredUsername,
          host: dummyUser.host,
        },
      }),
    )
    .mockResolvedValue(user);
  mockedPrisma.user.create
    .calledWith(
      expect.objectContaining({
        data: expectedDataForPrismaCreateOrUpdate,
      }),
    )
    .mockResolvedValueOnce(dummyNewUser as unknown as User);
  mockedPrisma.user.update
    .calledWith(
      expect.objectContaining({
        where: { id: dummyUser.id },
        data: expectedDataForPrismaCreateOrUpdate,
      }),
    )
    .mockResolvedValueOnce(dummyNewUser as unknown as User);
};

const 引数がID = () => ({ id: dummyUser.id });

const 引数がactorUrl = () => ({ actorUrl: new URL(dummyUser.actorUrl) });

const 引数がpreferredUsernameとhost = () => ({
  preferredUsername: dummyUser.preferredUsername,
  host: dummyUser.host,
});

const 情報の新しいユーザーがDBに存在する = () =>
  mockUser(dummyRecentUser as unknown as User);

const 情報の古いユーザーがDBに存在する = () =>
  mockUser(dummyOldUser as unknown as User);

const ユーザーがDBに存在しない = () => mockUser(null);

const 他サーバーからユーザー取得に成功した = () => {
  server.use(
    restSuccessWebfinger,
    rest.get("https://remote.example.com/u/dummyUser", (_, res, ctx) =>
      res(ctx.json(dummyPerson)),
    ),
  );
};

const WebFingerとの通信に失敗した = () => {
  server.use(
    rest.get(
      "https://remote.example.com/.well-known/webfinger",
      (_, res, ctx) => res(ctx.status(404)),
    ),
  );
};

const ActorURLとの通信に失敗した = () => {
  server.use(
    restSuccessWebfinger,
    rest.get("https://remote.example.com/u/dummyUser", (_, res, ctx) =>
      res(ctx.status(404)),
    ),
  );
};

const 通信しない = () => {};

const nullを返す = () => null;

const ユーザーを新規作成して返す = () => dummyNewUser;

const ユーザーを更新して返す = () => dummyNewUser;

const 情報の古いユーザーを返す = () => dummyOldUser;

const 情報の新しいユーザーを返す = () => dummyRecentUser;

describe("userService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockedNow);
  });
  describe("findOrFetchUser", () => {
    test.each`
      argsCondition                    | dbCondition                           | serverCondition                         | expected
      ${引数がID}                      | ${ユーザーがDBに存在しない}           | ${通信しない}                           | ${nullを返す}
      ${引数がactorUrl}                | ${ユーザーがDBに存在しない}           | ${WebFingerとの通信に失敗した}          | ${nullを返す}
      ${引数がactorUrl}                | ${ユーザーがDBに存在しない}           | ${ActorURLとの通信に失敗した}           | ${nullを返す}
      ${引数がactorUrl}                | ${ユーザーがDBに存在しない}           | ${他サーバーからユーザー取得に成功した} | ${ユーザーを新規作成して返す}
      ${引数がactorUrl}                | ${情報の古いユーザーがDBに存在する}   | ${WebFingerとの通信に失敗した}          | ${情報の古いユーザーを返す}
      ${引数がactorUrl}                | ${情報の古いユーザーがDBに存在する}   | ${ActorURLとの通信に失敗した}           | ${情報の古いユーザーを返す}
      ${引数がactorUrl}                | ${情報の古いユーザーがDBに存在する}   | ${他サーバーからユーザー取得に成功した} | ${ユーザーを更新して返す}
      ${引数がactorUrl}                | ${情報の新しいユーザーがDBに存在する} | ${通信しない}                           | ${情報の新しいユーザーを返す}
      ${引数がpreferredUsernameとhost} | ${ユーザーがDBに存在しない}           | ${他サーバーからユーザー取得に成功した} | ${ユーザーを新規作成して返す}
    `(
      "$argsCondition.name、$dbCondition.name、$serverCondition.nameとき、$expected.name",
      async ({ argsCondition, dbCondition, serverCondition, expected }) => {
        // arrange
        dbCondition();
        serverCondition();
        // act
        const user = await userService.findOrFetchUser(argsCondition());
        // assert
        expect(user).toEqual(expected());
      },
    );
  });
});
