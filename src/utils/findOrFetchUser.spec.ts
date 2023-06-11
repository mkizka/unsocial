import type { User } from "@prisma/client";
import type { AP } from "activitypub-core-types";
import { rest } from "msw";

import { server } from "@/mocks/server";
// なぜか"./mock"だとモック出来ない
import { mockedPrisma } from "@/utils/mock";

import { findOrFetchUserByWebfinger } from "./findOrFetchUser";
import { logger } from "./logger";

const dummyUser: User = {
  id: "dummyId",
  name: "Dummy",
  preferredUsername: "dummy",
  host: "remote.example.com",
  email: null,
  emailVerified: null,
  image: null,
  icon: null,
  publicKey: null,
  privateKey: null,
  actorUrl: null,
  inboxUrl: null,
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
    test("DBにあればそれを返す", async () => {
      // arrange
      mockedPrisma.user.findFirst.mockResolvedValue(dummyUser);
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
      mockedPrisma.user.create.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserByWebfinger(
        "dummy",
        "remote.example.com"
      );
      // assert
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "Dummy",
          host: "remote.example.com",
          preferredUsername: "dummy",
          publicKey: "publicKey",
          actorUrl: "https://remote.example.com/u/dummyId",
          inboxUrl: "https://remote.example.com/u/dummyId/inbox",
        },
      });
      expect(user).toEqual(dummyUser);
    });
  });
  test("DBになければWebFingerを叩いて新規ユーザーとして保存する(sharedInboxがあればそれを使う)", async () => {
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
            endpoints: {
              sharedInbox: "https://remote.example.com/inbox",
            },
          })
        );
      })
    );
    mockedPrisma.user.create.mockResolvedValue(dummyUser);
    // act
    const user = await findOrFetchUserByWebfinger(
      "dummy",
      "remote.example.com"
    );
    // assert
    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "Dummy",
        host: "remote.example.com",
        preferredUsername: "dummy",
        publicKey: "publicKey",
        actorUrl: "https://remote.example.com/u/dummyId",
        inboxUrl: "https://remote.example.com/inbox",
      },
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
