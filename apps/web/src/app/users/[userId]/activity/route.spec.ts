import type { User } from "@soshal/database";

import { findOrFetchUserByParams } from "@/utils/findOrFetchUser";

import { GET } from "./route";

jest.mock("@/utils/findOrFetchUser");
const mockedFindOrFetchUserByParams = jest.mocked(findOrFetchUserByParams);

describe("/users/[userId]/activity", () => {
  test("GET", async () => {
    // arrange
    mockedFindOrFetchUserByParams.mockResolvedValueOnce({
      id: "__id",
      publicKey: "__publicKey",
    } as User);
    // act
    const dummyParams = { userId: "__id" };
    const response = await GET({} as Request, { params: dummyParams });
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
