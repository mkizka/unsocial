import nock from "nock";

import { signActivity } from "@/utils/httpSignature/sign";
import { mockedPrisma } from "@/utils/mock";

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
      const scope = nock("https://remote.example.com")
        .post("/inbox")
        .reply(202);
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
      expect(scope.isDone()).toBeTruthy();
    });
  });

  describe("relayActivityToInboxUrl", () => {
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
      const scope1 = nock("https://remote1.example.com")
        .post("/inbox")
        .reply(202);
      const scope2 = nock("https://remote2.example.com")
        .post("/inbox")
        .reply(202);
      // @ts-ignore
      mockedSignActivity.mockReturnValue({});
      // act
      await relayActivityToFollowers({
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
      expect(scope1.isDone()).toBeTruthy();
      expect(scope2.isDone()).toBeTruthy();
    });
  });
});
