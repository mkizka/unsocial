import { mockDeep } from "jest-mock-extended";
import type { NextRequest } from "next/server";

import { mockedLogger } from "@/mocks/logger";
import { userService } from "@/server/service";
import { verifyActivity } from "@/utils/httpSignature/verify";

import { inbox } from "./_handlers";
import { POST } from "./route";

jest.mock("@/server/service");
const mockedFindOrFetchUserByActorId = jest.mocked(
  userService.findOrFetchUserByActorId,
);

jest.mock("@/utils/httpSignature/verify");
const mockedVerifyActivity = jest.mocked(verifyActivity);

jest.mock("./_handlers");
const mockedInbox = jest.mocked(inbox);

const dummyRemoteUser = {
  id: "dummyidremote",
  publicKey: "publicKey",
} as never;

const createMockedRequest = (body: Record<string, string>) => {
  const mockedRequest = mockDeep<NextRequest>();
  mockedRequest.nextUrl.pathname = "/users/foo/inbox";
  mockedRequest.json.mockResolvedValueOnce(body);
  return mockedRequest;
};

describe("/users/[userId]/inbox", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Any",
      actor: "https://remote.example.com/users/foo",
    };
    const request = createMockedRequest(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(dummyRemoteUser);
    mockedVerifyActivity.mockReturnValue({ isValid: true });
    mockedInbox.mockResolvedValue({ status: 200, message: "メッセージ" });
    // act
    const response = await POST(request);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("メッセージ");
    expect(response.status).toBe(200);
  });
  test("actorが無ければ400を返す", async () => {
    // arrange
    const activity = {
      type: "Any",
    };
    const request = createMockedRequest(activity);
    // act
    const response = await POST(request);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("検証失敗"),
    );
    expect(response.status).toBe(400);
  });
  test("actorで指定されたユーザーがDBになければ400を返す", async () => {
    // arrange
    const activity = {
      type: "Any",
      actor: "https://remote.example.com/users/foo",
    };
    const request = createMockedRequest(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(null);
    // act
    const response = await POST(request);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      "actorで指定されたユーザーが見つかりませんでした",
    );
    expect(response.status).toBe(400);
  });
  test("署名の検証結果が不正だったら400を返す", async () => {
    // arrange
    const activity = {
      type: "Any",
      actor: "https://remote.example.com/users/foo",
    };
    const request = createMockedRequest(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(dummyRemoteUser);
    mockedVerifyActivity.mockReturnValue({ isValid: false, reason: "foo" });
    // act
    const response = await POST(request);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("リクエストヘッダの署名が不正でした"),
    );
    expect(response.status).toBe(400);
  });
});
