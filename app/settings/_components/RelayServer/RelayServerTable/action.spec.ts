import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

jest.mock("next/cache");

describe("RelayServerTable/action", () => {
  test("指定したリレーサーバーを削除してrevalidatePathを呼ぶ", async () => {
    // arrange
    const relayServer = await prisma.relayServer.create({
      data: {
        inboxUrl: "https://relay.example.com/inbox",
      },
    });
    // act
    await action(relayServer.id);
    // assert
    expect(await prisma.relayServer.findFirst()).toBeNull();
  });
  test("指定したリレーサーバーが存在しない場合は何もしない", async () => {
    // act
    await action("not-exist");
    // assert
    expect(await prisma.relayServer.findFirst()).toBeNull();
  });
});
