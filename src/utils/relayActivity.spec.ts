import { rest } from "msw";

import { mockedPrisma } from "@/mocks/prisma";
import { server } from "@/mocks/server";
import { signActivity } from "@/utils/httpSignature/sign";

import {
  relayActivityToFollowers,
  relayActivityToInboxUrl,
} from "./relayActivity";

jest.mock("@/utils/httpSignature/sign");
const mockedSignActivity = jest.mocked(signActivity);

describe("relayActivity", () => {
  describe("relayActivityToInboxUrl", () => {
    test("正常系", async () => {
      // arrange
      const dummySender = {
        id: "dummy_sender",
        privateKey: "dummy_privateKey",
      };
      server.use(
        rest.post("https://remote.example.com/inbox", (_, res, ctx) => {
          return res.once(ctx.status(202));
        })
      );
      // @ts-ignore
      mockedSignActivity.mockReturnValue({});
      // act
      await relayActivityToInboxUrl({
        inboxUrl: new URL("https://remote.example.com/inbox"),
        sender: dummySender,
        // @ts-ignore
        activity: { type: "Dummy" },
      });
      // assert
      expect(mockedSignActivity).toHaveBeenCalledWith({
        inboxUrl: new URL("https://remote.example.com/inbox"),
        sender: dummySender,
        activity: { type: "Dummy" },
      });
    });
  });

  describe("relayActivityToFollowers", () => {
    test("正常系", async () => {
      // arrange
      const dummySender = {
        id: "dummy_sender",
        privateKey: "dummy_privateKey",
      };
      mockedPrisma.follow.findMany.mockResolvedValue([
        // @ts-ignore
        { follower: { inboxUrl: "https://remote1.example.com/inbox" } },
        // @ts-ignore
        { follower: { inboxUrl: "https://remote2.example.com/inbox" } },
        // @ts-ignore
        { follower: { inboxUrl: "https://remote2.example.com/inbox" } },
        // @ts-ignore
        { follower: { inboxUrl: null } },
      ]);
      server.use(
        rest.post("https://remote1.example.com/inbox", (_, res, ctx) => {
          return res.once(ctx.status(202));
        }),
        rest.post("https://remote2.example.com/inbox", (_, res, ctx) => {
          return res.once(ctx.status(202));
        })
      );
      // @ts-ignore
      mockedSignActivity.mockReturnValue({});
      // act
      await relayActivityToFollowers({
        sender: dummySender,
        // @ts-ignore
        activity: { type: "Dummy" },
      });
      // assert
      expect(mockedSignActivity).toHaveBeenNthCalledWith(1, {
        inboxUrl: new URL("https://remote1.example.com/inbox"),
        sender: dummySender,
        activity: { type: "Dummy" },
      });
      expect(mockedSignActivity).toHaveBeenNthCalledWith(2, {
        inboxUrl: new URL("https://remote2.example.com/inbox"),
        sender: dummySender,
        activity: { type: "Dummy" },
      });
    });
  });
});
