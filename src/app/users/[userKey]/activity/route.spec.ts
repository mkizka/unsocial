import type { User } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";

import { userService } from "@/server/service/user";

import { GET } from "./route";

jest.mock("@/server/service/user");
const mockedFindOrFetchUserByKey = jest.mocked(
  userService.findOrFetchUserByKey,
);

describe("/users/[userId]/activity", () => {
  test("GET", async () => {
    // arrange
    const mockedRequest = mockDeep<Request>();
    mockedRequest.headers.get.mockReturnValueOnce("application/activity+json");
    mockedFindOrFetchUserByKey.mockResolvedValueOnce({
      id: "__id",
      publicKey: "__publicKey",
    } as User);
    const dummyParams = { userKey: "__id" };
    // act
    const response = await GET(mockedRequest, { params: dummyParams });
    // assert
    expect(mockedFindOrFetchUserByKey).toHaveBeenCalledWith("__id");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/activity+json",
    );
    expect(await response.json()).toEqual(
      expect.objectContaining({
        type: "Person",
      }),
    );
  });
});
