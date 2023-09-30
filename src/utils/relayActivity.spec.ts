import type { Credential } from "@prisma/client";
import type { AP } from "activitypub-core-types";
import { captor } from "jest-mock-extended";
import { rest } from "msw";

import { mockedPrisma } from "@/mocks/prisma";
import { server } from "@/mocks/server";

import { mockedKeys } from "./httpSignature/__fixtures__/keys";
import {
  relayActivityToFollowers,
  relayActivityToInboxUrl,
} from "./relayActivity";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-01T00:00:00Z"));

jest.mock("@/../package.json", () => ({
  version: "1.2.3",
}));

describe("relayActivity", () => {
  describe("relayActivityToInboxUrl", () => {
    test("正常系", async () => {
      // arrange
      const dummyUserId = "dummy_userId";
      mockedPrisma.credential.findUnique.mockResolvedValueOnce({
        privateKey: mockedKeys.privateKey,
      } as Credential);
      const headerFn = jest.fn();
      const headerCaptor = captor();
      const bodyFn = jest.fn();
      const bodyCaptor = captor();
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
        activity: {
          type: "Dummy",
          actor: "https://myhost.example.com/users/dummy_other_userId/activity",
        } as unknown as AP.Activity,
      });
      // assert
      expect(headerFn).toHaveBeenCalledWith(headerCaptor);
      expect(headerCaptor.value).toMatchSnapshot();
      expect(bodyFn).toHaveBeenCalledWith(bodyCaptor);
      expect(bodyCaptor.value).toEqual({
        type: "Dummy",
        actor: "https://myhost.example.com/users/dummy_other_userId/activity",
      });
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
      const headerCaptors = [captor(), captor()];
      const bodyFn = jest.fn();
      const bodyCaptors = [captor(), captor()];
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
      expect(headerFn).toHaveBeenNthCalledWith(1, headerCaptors[0]);
      expect(headerCaptors[0]!.value).toMatchSnapshot();
      expect(headerFn).toHaveBeenNthCalledWith(2, headerCaptors[1]);
      expect(headerCaptors[1]!.value).toMatchSnapshot();
      expect(bodyFn).toHaveBeenCalledWith(bodyCaptors[0]);
      expect(bodyCaptors[0]!.value).toEqual({ type: "Dummy" });
      expect(bodyFn).toHaveBeenCalledWith(bodyCaptors[1]);
      expect(bodyCaptors[1]!.value).toEqual({ type: "Dummy" });
    });
  });
});
