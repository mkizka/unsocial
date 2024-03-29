import { http, HttpResponse } from "msw";

import { RelayServerFactory } from "@/_shared/factories/relayServer";
import { server } from "@/_shared/mocks/server";
import { systemUserService } from "@/_shared/user/services/systemUserService";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

jest.mock("next/cache");

describe("RelayServerForm/action", () => {
  test("リレーサーバーを登録しFollowアクティビティを配送できる", async () => {
    // arrange
    await systemUserService.findOrCreateSystemUser();
    const formData = new FormData();
    formData.append("inbox-url", "https://relay.example.com/inbox");
    const inboxFn = jest.fn();
    server.use(
      http.post("https://relay.example.com/inbox", async ({ request }) => {
        inboxFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    const result = await action(null, formData);
    // assert
    expect(await prisma.relayServer.findFirst()).toEqualPrisma({
      id: expect.any(String),
      inboxUrl: "https://relay.example.com/inbox",
      status: "SENT",
      createdAt: expect.anyDate(),
    });
    expect(inboxFn).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      type: "success",
      message: "リレーサーバーにFollowアクティビティを送信しました",
    });
  });
  test("登録済みのリレーサーバーであればエラーを返す", async () => {
    // arrange
    const relayServer = await RelayServerFactory.create();
    const formData = new FormData();
    formData.append("inbox-url", relayServer.inboxUrl);
    // act
    const result = await action(null, formData);
    // assert
    expect(result).toMatchObject({
      type: "error",
      message: "既に登録されています",
    });
  });
  test("リレーサーバのURLが不正な場合はエラー", async () => {
    // arrange
    const formData = new FormData();
    // act
    const result = await action(null, formData);
    // assert
    expect(result).toMatchObject({
      type: "error",
      message: "入力内容が不正です",
    });
  });
});
