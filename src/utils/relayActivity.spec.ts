import type { Credential } from "@prisma/client";
import { rest } from "msw";

import { mockedPrisma } from "@/mocks/prisma";
import { server } from "@/mocks/server";

import { mockedKeys } from "./httpSignature/__fixtures__/keys";
import {
  relayActivityToFollowers,
  relayActivityToInboxUrl,
} from "./relayActivity";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-02T00:00:00"));

describe("relayActivity", () => {
  describe("relayActivityToInboxUrl", () => {
    test("正常系", async () => {
      // arrange
      const dummyUserId = "dummy_userId";
      mockedPrisma.credential.findUnique.mockResolvedValueOnce({
        privateKey: mockedKeys.privateKey,
      } as Credential);
      const headerFn = jest.fn();
      const bodyFn = jest.fn();
      server.use(
        rest.post("https://remote.example.com/inbox", async (req, res, ctx) => {
          headerFn(req.headers.all());
          bodyFn(await req.json());
          return res.once(ctx.status(202));
        }),
      );
      // act
      await relayActivityToInboxUrl({
        userId: dummyUserId,
        inboxUrl: new URL("https://remote.example.com/inbox"),
        // @ts-ignore
        activity: { type: "Dummy" },
      });
      // assert
      expect(headerFn.mock.calls[0][0]).toMatchSnapshot();
      expect(bodyFn.mock.calls[0][0]).toEqual({ type: "Dummy" });
    });
  });

  describe("relayActivityToFollowers", () => {
    test("正常系", async () => {
      // arrange
      const dummyUserId = "dummy_userId";
      mockedPrisma.follow.findMany.mockResolvedValue([
        {
          // @ts-ignore
          follower: { inboxUrl: "https://remote1.example.com/users/foo/inbox" },
        },
        // @ts-ignore
        { follower: { inboxUrl: "https://remote2.example.com/inbox" } },
        // @ts-ignore
        { follower: { inboxUrl: "https://remote2.example.com/inbox" } },
        // @ts-ignore
        { follower: { inboxUrl: null } },
      ]);
      mockedPrisma.credential.findUnique.mockResolvedValueOnce({
        privateKey: mockedKeys.privateKey,
      } as Credential);
      const headerFn = jest.fn();
      const bodyFn = jest.fn();
      const inbox1 = rest.post(
        "https://remote1.example.com/users/foo/inbox",
        async (req, res, ctx) => {
          headerFn(req.headers.all());
          bodyFn(await req.json());
          return res.once(ctx.status(202));
        },
      );
      const inbox2 = rest.post(
        "https://remote2.example.com/inbox",
        async (req, res, ctx) => {
          headerFn(req.headers.all());
          bodyFn(await req.json());
          return res.once(ctx.status(202));
        },
      );
      server.use(inbox1, inbox2);
      // act
      await relayActivityToFollowers({
        userId: dummyUserId,
        // @ts-ignore
        activity: { type: "Dummy" },
      });
      // assert
      expect(headerFn.mock.calls[0][0]).toMatchSnapshot();
      expect(headerFn.mock.calls[1][0]).toMatchSnapshot();
      expect(bodyFn.mock.calls[0][0]).toEqual({ type: "Dummy" });
      expect(bodyFn.mock.calls[1][0]).toEqual({ type: "Dummy" });
    });
  });
});
