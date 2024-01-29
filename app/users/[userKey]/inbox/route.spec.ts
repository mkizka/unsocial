import { NextRequest } from "next/server";

import { mockedLogger } from "@/_shared/mocks/logger";

import { inboxService } from "./_services/inboxService";
import { BadActivityRequestError } from "./_services/inboxService/handlers/errors";
import { POST } from "./route";

jest.mock("./_services/inboxService");
const mockedInboxService = jest.mocked(inboxService);

const createMockedRequest = (body: Record<string, string>) => {
  const mockedRequest = new NextRequest(
    new URL("https://myhost.example.com/users/foo/inbox"),
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
      },
    },
  );
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
      new BadActivityRequestError("エラー"),
    );
    // act
    const response = await POST(request);
    // assert
    expect(mockedLogger.warn).toHaveBeenCalledWith("エラー", expect.anything());
    expect(response.status).toBe(400);
  });
});
