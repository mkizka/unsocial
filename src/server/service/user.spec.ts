import type { User } from "@prisma/client";
import type { AP } from "activitypub-core-types";
import { rest } from "msw";

import { mockedPrisma } from "@/mocks/prisma";
import { server } from "@/mocks/server";

import { findOrFetchUserByActorId } from "./user";

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

const restDummyId = (person?: object) => {
  return rest.get(dummyUser.actorUrl!, (_, res, ctx) =>
    res.once(ctx.json({ ...dummyPerson, ...person }))
  );
};

describe("findOrFetchUserByActorId", () => {
  describe("正常系", () => {
    test("最近fetchしたユーザーがDBにあればそれを返す", async () => {
      // arrange
      mockedPrisma.user.findFirst.mockResolvedValueOnce(dummyUser);
      // act
      const user = await findOrFetchUserByActorId(new URL(dummyUser.actorUrl!));
      // assert
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { actorUrl: dummyUser.actorUrl },
      });
      expect(user).toEqual(dummyUser);
    });
    test("fetchしてから時間が経っていればWebFingerを叩いて既存ユーザーを更新する", async () => {
      // arrange
      server.use(restDummyId());
      mockedPrisma.user.findFirst.mockResolvedValue({
        ...dummyUser,
        lastFetchedAt: new Date("2023-01-01T00:00:00Z"),
      });
      mockedPrisma.user.update.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserByActorId(new URL(dummyUser.actorUrl!));
      // assert
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: dummyUser.id },
        data: expectedData,
      });
      expect(user).toEqual(dummyUser);
    });
    test("DBになければWebFingerを叩いて新規ユーザーとして保存する", async () => {
      // arrange
      server.use(restDummyId());
      mockedPrisma.user.findFirst.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue(dummyUser);
      // act
      const user = await findOrFetchUserByActorId(new URL(dummyUser.actorUrl!));
      // assert
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: expectedData,
      });
      expect(user).toEqual(dummyUser);
    });
  });
});
