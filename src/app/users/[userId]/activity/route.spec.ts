import type { User } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";

import { findOrFetchUserByParams } from "@/utils/findOrFetchUser";

import { GET } from "./route";

jest.mock("@/utils/findOrFetchUser");
const mockedFindOrFetchUserByParams = jest.mocked(findOrFetchUserByParams);

describe("/users/[userId]/activity", () => {
  test("GET", async () => {
    // arrange
    const mockedRequest = mockDeep<Request>();
    mockedRequest.headers.get.mockReturnValueOnce("application/activity+json");
    mockedFindOrFetchUserByParams.mockResolvedValueOnce({
      id: "__id",
      publicKey: "__publicKey",
    } as User);
    const dummyParams = { userId: "__id" };
    // act
    const response = await GET(mockedRequest, { params: dummyParams });
    // assert
    expect(mockedFindOrFetchUserByParams).toHaveBeenCalledWith(dummyParams);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/activity+json"
    );
    expect(await response.json()).toEqual(
      expect.objectContaining({
        type: "Person",
      })
    );
  });
});
