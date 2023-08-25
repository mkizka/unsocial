import type { User } from "@prisma/client";
import type { AP } from "activitypub-core-types";
import { rest } from "msw";

import { mockedLogger } from "@/mocks/logger";
import { mockedPrisma } from "@/mocks/prisma";
import { server } from "@/mocks/server";

import {
  findOrFetchUserByActorId,
  findOrFetchUserByParams,
  findUserByActorId,
} from "./user";

const mockedNow = new Date("2023-01-01T12:00:00Z");
jest.useFakeTimers();
jest.setSystemTime(mockedNow);

const dummyUser = {
  id: "dummyId",
  name: "Dummy",
  preferredUsername: "dummy",
  host: "remote.example.com",
  icon: null,
  actorUrl: "https://remote.example.com/u/dummyId",
  inboxUrl: "https://remote.example.com/u/dummyId/inbox",
  publicKey: "publicKey",
  lastFetchedAt: new Date("2023-01-01T11:00:00Z"),
} as User;

const { id: _, ...expectedData } = {
  ...dummyUser,
  lastFetchedAt: mockedNow,
};

const dummyPerson: AP.Person = {
  id: new URL("https://remote.example.com/u/dummyId"),
  type: "Person",
  name: "Dummy",
  preferredUsername: "dummy",
  inbox: new URL("https://remote.example.com/u/dummyId/inbox"),
  outbox: new URL("https://remote.example.com/u/dummyId/outbox"),
  publicKey: {
    id: "https://remote.example.com/u/dummyId#main-key",
    owner: "https://remote.example.com/u/dummyId",
    publicKeyPem: "publicKey",
  },
};

const dummyOldUser = {
  ...dummyUser,
  lastFetchedAt: new Date("2023-01-01T00:00:00Z"),
};

const restWebfinger = (response?: object) => {
  return rest.get(
    "https://remote.example.com/.well-known/webfinger",
    (req, res, ctx) => {
      if (
        req.url.searchParams.get("resource") != "acct:dummy@remote.example.com"
      ) {
        return res(ctx.status(404));
      }
      return res(
        ctx.json({
          links: [
            { rel: "dummy", href: "https://example.com" },
            {
              rel: "self",
              href: "https://remote.example.com/u/dummyId",
            },
          ],
          ...response,
        }),
      );
    },
  );
};

const restWebfinger404 = () => {
  return rest.get(
    "https://remote.example.com/.well-known/webfinger",
    (_, res, ctx) => res.once(ctx.status(404)),
  );
};

const restWebfingerTimeout = () => {
  return rest.get(
    "https://remote.example.com/.well-known/webfinger",
    (_, res, ctx) => res.once(ctx.delay("infinite")),
  );
};

const restDummyId = (person?: object) => {
  return rest.get("https://remote.example.com/u/dummyId", (_, res, ctx) =>
    res.once(ctx.json({ ...dummyPerson, ...person })),
  );
};

const restDummyId404 = () => {
  return rest.get("https://remote.example.com/u/dummyId", (_, res, ctx) =>
    res.once(ctx.status(404)),
  );
};

const restDummyIdInvalid = (person?: object) => {
  return rest.get("https://remote.example.com/u/dummyId", (_, res, ctx) =>
    res.once(ctx.json({ invalid: "dummy" })),
  );
};

const params = { userId: "@dummy@remote.example.com" };

describe("userService", () => {
  describe("findOrFetchUserByActorId", () => {
    describe("正常系", () => {
      test("最近fetchしたユーザーがDBにあればそれを返す", async () => {
        // arrange
        mockedPrisma.user.findFirst.mockResolvedValueOnce(dummyUser);
        // act
        const user = await findOrFetchUserByActorId(
          new URL(dummyUser.actorUrl!),
        );
        // assert
        expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
          where: { actorUrl: dummyUser.actorUrl },
        });
        expect(user).toEqual(dummyUser);
      });
      test("fetchしてから時間が経っていればActorIdを叩いて既存ユーザーを更新する", async () => {
        // arrange
        server.use(restDummyId());
        mockedPrisma.user.findFirst.mockResolvedValue(dummyOldUser);
        mockedPrisma.user.update.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByActorId(
          new URL(dummyUser.actorUrl!),
        );
        // assert
        expect(mockedPrisma.user.update).toHaveBeenCalledWith({
          where: { id: dummyUser.id },
          data: expectedData,
        });
        expect(user).toEqual(dummyUser);
      });
      test("fetchしてから時間が経ってActorIdを叩いたが失敗した場合、既存ユーザーを返す", async () => {
        // arrange
        server.use(restDummyId404());
        mockedPrisma.user.findFirst.mockResolvedValue(dummyOldUser);
        // act
        const user = await findOrFetchUserByActorId(
          new URL(dummyUser.actorUrl!),
        );
        // assert
        expect(mockedLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining("NotOKError"),
        );
        expect(user).toEqual(dummyOldUser);
      });
      test("fetchしてから時間が経っていてActorIdを叩いたがタイムアウトした場合、既存ユーザーを返す", async () => {
        // arrange
        server.use(
          rest.get(dummyUser.actorUrl!, (_, res, ctx) =>
            res.once(ctx.delay(3000)),
          ),
        );
        mockedPrisma.user.findFirst.mockResolvedValue(dummyOldUser);
        // act
        const user = await findOrFetchUserByActorId(
          new URL(dummyUser.actorUrl!),
        );
        // assert
        expect(mockedLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining("TimeoutError"),
        );
        expect(user).toEqual(dummyOldUser);
      });
      test("DBになければActorIdを叩いて新規ユーザーとして保存する", async () => {
        // arrange
        server.use(restDummyId());
        mockedPrisma.user.findFirst.mockResolvedValue(null);
        mockedPrisma.user.create.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByActorId(
          new URL(dummyUser.actorUrl!),
        );
        // assert
        expect(mockedPrisma.user.create).toHaveBeenCalledWith({
          data: expectedData,
        });
        expect(user).toEqual(dummyUser);
      });
    });
  });
  describe("findOrFetchUserByParams", () => {
    describe("正常系", () => {
      test("@から始まっていなければidとしてDBを検索する", async () => {
        // arrange
        mockedPrisma.user.findFirst.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByParams({ userId: "dummyId" });
        // assert
        expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
          where: { id: "dummyId" },
        });
        expect(user).toEqual(dummyUser);
      });
      test("@が先頭のみであれば以降をpreferredUsername、hostをenv.HOSTとしてDBを検索する", async () => {
        // arrange
        mockedPrisma.user.findFirst.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByParams({ userId: "@dummy" });
        // assert
        expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
          where: { preferredUsername: "dummy", host: "myhost.example.com" },
        });
        expect(user).toEqual(dummyUser);
      });
      test("最近fetchしたユーザーがDBにあればそれを返す", async () => {
        // arrange
        mockedPrisma.user.findFirst.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByParams(params);
        // assert
        expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
          where: { preferredUsername: "dummy", host: "remote.example.com" },
        });
        expect(user).toEqual(dummyUser);
      });
      test("fetchしてから時間が経っていればWebFingerを叩いて既存ユーザーを更新する", async () => {
        // arrange
        server.use(restWebfinger(), restDummyId());
        mockedPrisma.user.findFirst.mockResolvedValue({
          ...dummyUser,
          lastFetchedAt: new Date("2023-01-01T00:00:00Z"),
        });
        mockedPrisma.user.update.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByParams(params);
        // assert
        expect(mockedPrisma.user.update).toHaveBeenCalledWith({
          where: { id: dummyUser.id },
          data: expectedData,
        });
        expect(user).toEqual(dummyUser);
      });
      test("fetchしてから時間が経っていればWebFingerを叩いて既存ユーザーを更新する(id指定)", async () => {
        // arrange
        server.use(restWebfinger(), restDummyId());
        mockedPrisma.user.findFirst.mockResolvedValue({
          ...dummyUser,
          lastFetchedAt: new Date("2023-01-01T00:00:00Z"),
        });
        mockedPrisma.user.update.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByParams({ userId: dummyUser.id });
        // assert
        expect(mockedPrisma.user.update).toHaveBeenCalledWith({
          where: { id: dummyUser.id },
          data: expectedData,
        });
        expect(user).toEqual(dummyUser);
      });
      test("fetchしてから時間が経っていてWebFingerを叩いたが失敗した場合、既存ユーザーを返す", async () => {
        // arrange
        server.use(restWebfinger404(), restDummyId());
        mockedPrisma.user.findFirst.mockResolvedValue(dummyOldUser);
        // act
        const user = await findOrFetchUserByParams({ userId: dummyUser.id });
        // assert
        expect(mockedLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining("NotOKError"),
        );
        expect(user).toEqual(dummyOldUser);
      });
      test("fetchしてから時間が経っていてWebFingerを叩いてタイムアウトした場合、既存ユーザーを返す", async () => {
        // arrange
        server.use(restWebfingerTimeout(), restDummyId());
        mockedPrisma.user.findFirst.mockResolvedValue(dummyOldUser);
        // act
        const user = await findOrFetchUserByParams({ userId: dummyUser.id });
        // assert
        expect(mockedLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining("TimeoutError"),
        );
        expect(user).toEqual(dummyOldUser);
      });
      test("DBになければWebFingerを叩いて新規ユーザーとして保存する", async () => {
        // arrange
        server.use(restWebfinger(), restDummyId());
        mockedPrisma.user.findFirst.mockResolvedValue(null);
        mockedPrisma.user.create.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByParams(params);
        // assert
        expect(mockedPrisma.user.create).toHaveBeenCalledWith({
          data: expectedData,
        });
        expect(user).toEqual(dummyUser);
      });
      test("DBになければWebFingerを叩いて新規ユーザーとして保存する(sharedInbox,iconがあればそれを使う)", async () => {
        // arrange
        server.use(
          restWebfinger(),
          restDummyId({
            icon: { url: "https://remote.example.com/icons/dummy" },
            endpoints: { sharedInbox: "https://remote.example.com/inbox" },
          }),
        );
        mockedPrisma.user.findFirst.mockResolvedValue(null);
        mockedPrisma.user.create.mockResolvedValue(dummyUser);
        // act
        const user = await findOrFetchUserByParams(params);
        // assert
        expect(mockedPrisma.user.create).toHaveBeenCalledWith({
          data: {
            ...expectedData,
            icon: "https://remote.example.com/icons/dummy",
            inboxUrl: "https://remote.example.com/inbox",
          },
        });
        expect(user).toEqual(dummyUser);
      });
    });
    describe("異常系", () => {
      test("@のみならnullを返す", async () => {
        // act
        const user = await findOrFetchUserByParams({ userId: "@" });
        // assert
        expect(mockedPrisma.user.findFirst).not.toHaveBeenCalled();
        expect(user).toEqual(null);
      });
      test("hostが不正ならnullを返す", async () => {
        // act
        const user = await findOrFetchUserByParams({ userId: "@dummy@\\" });
        // assert
        expect(mockedLogger.info).toHaveBeenCalledWith(
          "https://\\がURLとして不正でした",
        );
        expect(user).toEqual(null);
      });
      test("hostのWebFingerが200を返さない場合はnullを返す", async () => {
        // arrange
        server.use(restWebfinger404());
        // act
        const user = await findOrFetchUserByParams(params);
        // assert
        expect(mockedLogger.warn).toBeCalledWith(
          expect.stringContaining("NotOKError"),
        );
        expect(user).toEqual(null);
      });
      test("hostのWebFingerが不正な場合はnullを返す", async () => {
        // arrange
        server.use(restWebfinger({ links: "invalid" }));
        // act
        const user = await findOrFetchUserByParams(params);
        // assert
        expect(mockedLogger.info).toBeCalledWith(
          expect.stringContaining("検証失敗"),
        );
        expect(user).toEqual(null);
      });
      test("hostのWebFingerにhrefがなかった場合はnullを返す", async () => {
        // arrange
        server.use(restWebfinger({ links: [] }));
        // act
        const user = await findOrFetchUserByParams(params);
        // assert
        expect(mockedLogger.info).toBeCalledWith(
          "WebFingerからrel=selfの要素が取得できませんでした",
        );
        expect(user).toEqual(null);
      });

      test("hostのhrefから有効なデータが返されなかった場合はnullを返す", async () => {
        // arrange
        server.use(restWebfinger(), restDummyIdInvalid());
        // act
        const user = await findOrFetchUserByParams(params);
        // assert
        expect(mockedLogger.info).toBeCalledWith(
          expect.stringContaining("検証失敗"),
        );
        expect(user).toEqual(null);
      });
    });
  });
  describe("findUserByActorId", () => {
    describe("正常系", () => {
      test.each`
        actorUrl                                      | userId
        ${"https://myhost.example.com/users/foo"}     | ${"foo"}
        ${"https://myhost.example.com/users/foo/bar"} | ${"foo"}
      `(
        "$actorUrl に対して id: $userId のユーザーを返す",
        async ({ actorUrl, userId }) => {
          // act
          await findUserByActorId(new URL(actorUrl));
          // assert
          expect(mockedPrisma.user.findFirst).toBeCalledWith({
            where: { id: userId },
            include: { credential: true },
          });
        },
      );
    });
    describe("異常系", () => {
      test.each`
        actorUrl
        ${"https://myhost.example.com/user/foo"}
        ${"https://myhost.example.com/foo/users/bar"}
      `("$actorUrl に対して null を返す", async ({ actorUrl, userId }) => {
        // act
        const user = await findUserByActorId(new URL(actorUrl));
        // assert
        expect(user).toBeNull();
        expect(mockedPrisma.user.findFirst).not.toHaveBeenCalled();
      });
    });
  });
});
