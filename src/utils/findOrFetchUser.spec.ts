import type { User } from "@prisma/client";
import type { AP } from "activitypub-core-types";
import { rest } from "msw";

import { server } from "@/mocks/server";
// なぜか"./mock"だとモック出来ない
import { mockedPrisma } from "@/utils/mock";

import { findOrFetchUserByWebfinger } from "./findOrFetchUser";
import { logger } from "./logger";

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
};

const { id: _, ...dummyUserWithoutId } = dummyUser;
const upsertData = {
  ...dummyUserWithoutId,
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

jest.mock("./logger");
const mockedLogger = jest.mocked(logger);

describe("findOrFetchUser", () => {
  describe("正常系", () => {
    test("最近fetchしたユーザーがDBにあればそれを返す", async () => {
      // arrange
      mockedPrisma.user.findFirst.mockResolvedValue(dummyUser as User);
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { preferredUsername: "dummy", host: "remote.example.com" },
      });
      expect(user).toEqual(dummyUser);
    });
    test("fetchしてから時間が経っていればWebFingerを叩いて新規ユーザーとして保存する", async () => {
      // arrange
      mockedPrisma.user.findFirst.mockResolvedValue(null);
      server.use(
        rest.get(
          "https://remote.example.com/.well-known/webfinger",
          (req, res, ctx) => {
            if (
              req.url.searchParams.get("resource") !=
              "acct:dummy@remote.example.com"
            ) {
              return res.once(ctx.status(404));
            }
            return res.once(
              ctx.json({
                links: [
                  { rel: "dummy", href: "https://example.com" },
                  {
                    rel: "self",
                    href: "https://remote.example.com/users/dummyId",
                  },
                ],
              })
            );
          }
        ),
        rest.get("https://remote.example.com/users/dummyId", (_, res, ctx) =>
          res.once(ctx.json(dummyPerson))
        )
      );
      mockedPrisma.user.findFirst.mockResolvedValue({
        ...dummyUser,
        lastFetchedAt: new Date("2023-01-01T00:00:00Z"),
      } as User);
      mockedPrisma.user.upsert.mockResolvedValue(dummyUser as User);
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(mockedPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: "dummyId" },
        create: upsertData,
        update: upsertData,
      });
      expect(user).toEqual(dummyUser);
    });
    test("DBになければWebFingerを叩いて新規ユーザーとして保存する", async () => {
      // arrange
      mockedPrisma.user.findFirst.mockResolvedValue(null);
      server.use(
        rest.get(
          "https://remote.example.com/.well-known/webfinger",
          (req, res, ctx) => {
            if (
              req.url.searchParams.get("resource") !=
              "acct:dummy@remote.example.com"
            ) {
              return res.once(ctx.status(404));
            }
            return res.once(
              ctx.json({
                links: [
                  { rel: "dummy", href: "https://example.com" },
                  {
                    rel: "self",
                    href: "https://remote.example.com/users/dummyId",
                  },
                ],
              })
            );
          }
        ),
        rest.get("https://remote.example.com/users/dummyId", (_, res, ctx) =>
          res.once(ctx.json(dummyPerson))
        )
      );
      mockedPrisma.user.upsert.mockResolvedValue(dummyUser as User);
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(mockedPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: "dummyId" },
        create: upsertData,
        update: upsertData,
      });
      expect(user).toEqual(dummyUser);
    });
  });
  test("DBになければWebFingerを叩いて新規ユーザーとして保存する(sharedInbox,iconがあればそれを使う)", async () => {
    // arrange
    mockedPrisma.user.findFirst.mockResolvedValue(null);
    server.use(
      rest.get(
        "https://remote.example.com/.well-known/webfinger",
        (req, res, ctx) => {
          if (
            req.url.searchParams.get("resource") !=
            "acct:dummy@remote.example.com"
          ) {
            return res.once(ctx.status(404));
          }
          return res.once(
            ctx.json({
              links: [
                { rel: "dummy", href: "https://example.com" },
                {
                  rel: "self",
                  href: "https://remote.example.com/users/dummyId",
                },
              ],
            })
          );
        }
      ),
      rest.get("https://remote.example.com/users/dummyId", (_, res, ctx) => {
        return res.once(
          ctx.json({
            ...dummyPerson,
            icon: {
              url: "https://remote.example.com/icons/dummy",
            },
            endpoints: {
              sharedInbox: "https://remote.example.com/inbox",
            },
          })
        );
      })
    );
    mockedPrisma.user.upsert.mockResolvedValue(dummyUser as User);
    // act
    const user = await findOrFetchUserByWebfinger(
      "dummy",
      "remote.example.com"
    );
    // assert
    const data = {
      ...upsertData,
      icon: "https://remote.example.com/icons/dummy",
      inboxUrl: "https://remote.example.com/inbox",
    };
    expect(mockedPrisma.user.upsert).toHaveBeenCalledWith({
      where: { id: "dummyId" },
      create: data,
      update: data,
    });
    expect(user).toEqual(dummyUser);
  });
  describe("異常系", () => {
    test("hostが不正ならnullを返す", async () => {
      // act
      const user = await findOrFetchUserByWebfinger("dummmy", "\\");
      // assert
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "https://\\がURLとして不正でした"
      );
      expect(user).toEqual(null);
    });
    test("hostのWebFingerが200を返さない場合はnullを返す", async () => {
      // arrange
      server.use(
        rest.get(
          "https://remote.example.com/.well-known/webfinger",
          (_, res, ctx) => res.once(ctx.status(404))
        )
      );
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(mockedLogger.warn).toBeCalledWith(
        expect.stringContaining("HTTPエラー")
      );
      expect(user).toEqual(null);
    });
    test("hostのWebFingerが不正な場合はnullを返す", async () => {
      // arrange
      server.use(
        rest.get(
          "https://remote.example.com/.well-known/webfinger",
          (_, res, ctx) => res.once(ctx.json({ links: "invalid" }))
        )
      );
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(mockedLogger.info).toBeCalledWith(
        expect.stringContaining("検証失敗")
      );
      expect(user).toEqual(null);
    });
    test("hostのWebFingerにhrefがなかった場合はnullを返す", async () => {
      // arrange
      server.use(
        rest.get(
          "https://remote.example.com/.well-known/webfinger",
          (_, res, ctx) =>
            res.once(
              ctx.json({
                links: [],
              })
            )
        )
      );
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(mockedLogger.info).toBeCalledWith(
        "WebFingerからrel=selfの要素が取得できませんでした"
      );
      expect(user).toEqual(null);
    });
    test("hostのhrefから有効なデータが返されなかった場合はnullを返す", async () => {
      // arrange
      server.use(
        rest.get(
          "https://remote.example.com/.well-known/webfinger",
          (_, res, ctx) =>
            res.once(
              ctx.json({
                links: [
                  {
                    rel: "self",
                    href: "https://remote.example.com/users/dummyId",
                  },
                ],
              })
            )
        ),
        rest.get("https://remote.example.com/users/dummyId", (_, res, ctx) => {
          return res.once(ctx.json({ invalid: "dummy" }));
        })
      );
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(mockedLogger.info).toBeCalledWith(
        expect.stringContaining("検証失敗")
      );
      expect(user).toEqual(null);
    });
  });
});
