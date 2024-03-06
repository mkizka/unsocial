import type { User } from "@prisma/client";

import { userFindService } from ".";
import { findOrFetchUserById } from "./userFindRepository/byId";
import { findOrFetchUserByWebFinger } from "./userFindRepository/byWebfinger";

jest.mock("./userFindRepository/byId");
jest.mock("./userFindRepository/byWebfinger");

describe("userService", () => {
  const mockedById = jest.mocked(findOrFetchUserById);
  const mockedByWebFinger = jest.mocked(findOrFetchUserByWebFinger);
  const dummyUser = { id: "foo" } as User;

  describe("findOrFetchUserByKey", () => {
    test("idの場合はfindOrFetchUserByIdを呼び出す", async () => {
      // arrange
      mockedById.mockResolvedValueOnce(dummyUser);
      // act
      const user = await userFindService.findOrFetchUserByKey("foo");
      // assert
      expect(user).toBe(dummyUser);
      expect(mockedById).toHaveBeenCalledWith("foo");
    });
    test("@から始まる場合はfindOrFetchUserByWebFingerを呼び出す", async () => {
      // arrange
      mockedByWebFinger.mockResolvedValueOnce(dummyUser);
      // act
      const user = await userFindService.findOrFetchUserByKey(
        "@foo@remote.example.com",
      );
      // assert
      expect(user).toBe(dummyUser);
      expect(mockedByWebFinger).toHaveBeenCalledWith({
        preferredUsername: "foo",
        host: "remote.example.com",
      });
    });
  });
});
