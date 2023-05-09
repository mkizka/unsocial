import { mockDeep } from "jest-mock-extended";

import { prismaMock } from "../../../__mocks__/db";
import { queue } from "../../background/queue";
import { appRouter } from "../root";

jest.mock("../../background/queue");
const mockedQueue = jest.mocked(queue);

type TRPCContext = Parameters<typeof appRouter.createCaller>[0];

const dummyLocalUser = {
  id: "dummy_local",
  privateKey: "privateKey",
};

describe("like", () => {
  describe("details", () => {
    test("いいね詳細を表示するためのデータが呼ばれる", async () => {
      // arrange
      const ctx = mockDeep<TRPCContext>();
      ctx.session = {
        user: dummyLocalUser,
        expires: "",
      };
      // act
      const caller = appRouter.createCaller(ctx);
      await caller.like.details("noteId");
      // assert
      expect(prismaMock.like.findMany).toHaveBeenCalledWith({
        select: {
          content: true,
          user: {
            select: {
              id: true,
              name: true,
              preferredUsername: true,
              host: true,
            },
          },
        },
        where: { noteId: "noteId" },
      });
    });
  });
});
