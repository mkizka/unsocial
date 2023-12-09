import { mockDeep } from "jest-mock-extended";
import type { NextRequest } from "next/server";

import { mockedLogger } from "@/_mocks/logger";
import { inboxService } from "@/_shared/service/inbox";
import { BadActivityRequestError } from "@/_shared/service/inbox/errors";

import { POST } from "./route";

jest.mock("@/_shared/service/inbox");
const mockedInboxService = jest.mocked(inboxService);

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
    // act
    const response = await POST(request);
    // assert
    expect(mockedLogger.info).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });
  test("inboxServiceが返したエラーに応じてレスポンスを返す", async () => {
    // arrange
    const activity = {
      type: "Any",
    };
    const request = createMockedRequest(activity);
    mockedInboxService.perform.mockResolvedValueOnce(
      new BadActivityRequestError("エラー", activity),
    );
    // act
    const response = await POST(request);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining("エラー"),
    );
    expect(response.status).toBe(400);
  });
});
