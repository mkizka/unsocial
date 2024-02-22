import { http, HttpResponse } from "msw";

import { server } from "@/_shared/mocks/server";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

jest.mock("next/cache");

describe("RelayServerTable/action", () => {
  test("指定したリレーサーバーを削除してUndoアクティビティを", async () => {
    // arrange
    const inboxUrl = "https://relay.example.com/inbox";
    const relayServer = await prisma.relayServer.create({
      data: {
        inboxUrl,
      },
    });
    const inboxFn = jest.fn();
    server.use(
      http.post(inboxUrl, async ({ request }) => {
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
