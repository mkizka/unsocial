import type { User } from "@prisma/client";
import { rest } from "msw";

import { mockedPrisma } from "@/mocks/prisma";
import { server } from "@/mocks/server";

import * as userService from "./user";

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
  lastFetchedAt: new Date("2023-01-01T11:00:00Z"), // 1時間前に取得した
};

const { id: _, ...expectedDataForPrismaCreateOrUpdate } = {
  ...dummyUser,
  lastFetchedAt: mockedNow,
};

const dummyOldUser = {
  ...dummyUser,
  lastFetchedAt: new Date("2023-01-01T00:00:00Z"), // 12時間前に取得した
};

const mockFind = (user: User) => {
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
};

const mockCreateOrUpdate = (user: User) => {
  mockedPrisma.user.create
    .calledWith(
      expect.objectContaining({
        data: expectedDataForPrismaCreateOrUpdate,
      }),
    )
    .mockResolvedValueOnce(user);
  mockedPrisma.user.update
    .calledWith(
      expect.objectContaining({
        where: { id: dummyUser.id },
        data: expectedDataForPrismaCreateOrUpdate,
      }),
    )
    .mockResolvedValueOnce(user);
};

const dummyWebfinger = rest.get(
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

const dummyActor = rest.get(
  "https://remote.example.com/u/dummyUser",
  (_, res, ctx) => res(ctx.json(dummyPerson)),
);

describe("userService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockedNow);
  });
  describe("findOrFetchUser", () => {
    describe.each`
      params                                                                      | description
      ${{ actorUrl: new URL(dummyUser.actorUrl) }}                                | ${"actorUrlが指定された時"}
      ${{ id: dummyUser.id }}                                                     | ${"idが指定された時"}
      ${{ preferredUsername: dummyUser.preferredUsername, host: dummyUser.host }} | ${"preferredUsernameとhostが指定された時"}
    `("$description", ({ params, expected }) => {
      test.each`
        mockedUser      | mockedHandlers                  | expected     | description
        ${dummyUser}    | ${[]}                           | ${dummyUser} | ${"最近fetchしたユーザーがDBにあればそれを返す"}
        ${dummyOldUser} | ${[dummyWebfinger, dummyActor]} | ${dummyUser} | ${"fetchしてから時間が経ったユーザーがDBにあればWebfingerを叩いて返す"}
        ${dummyOldUser} | ${[dummyWebfinger, dummyActor]} | ${dummyUser} | ${"ユーザーがDBに無ければWebfingerを叩いて返す"}
      `("$description", async ({ mockedUser, mockedHandlers, expected }) => {
        // arrange
        mockFind(mockedUser);
        mockCreateOrUpdate(expected);
        server.use(...mockedHandlers);
        // act
        const user = await userService.findOrFetchUser(params);
        // assert
        expect(user).toEqual(expected);
      });
    });
  });
});
