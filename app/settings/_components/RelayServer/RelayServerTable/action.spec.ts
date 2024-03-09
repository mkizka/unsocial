import { http, HttpResponse } from "msw";

import { RelayServerFactory } from "@/_shared/factories/relayServer";
import { server } from "@/_shared/mocks/server";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

jest.mock("next/cache");

describe("RelayServerTable/action", () => {
  test("指定したリレーサーバーを削除してUndoアクティビティを配送", async () => {
    // arrange
    const relayServer = await RelayServerFactory.create();
    const inboxFn = jest.fn();
    server.use(
      http.post(relayServer.inboxUrl, async ({ request }) => {
        inboxFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await action(relayServer.id);
    // assert
    expect(await prisma.relayServer.findFirst()).toBeNull();
    expect(inboxFn).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "Undo",
      }),
    );
  });
  test("指定したリレーサーバーが存在しない場合は何もしない", async () => {
    // act
    await action("not-exist");
    // assert
    expect(await prisma.relayServer.findFirst()).toBeNull();
  });
});
