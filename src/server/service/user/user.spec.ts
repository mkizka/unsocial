import type { User } from "@prisma/client";

import { RedirectError } from "./errors";
import {
  findOrFetchUserById,
  findOrFetchUserByWebFinger,
} from "./findOrFetchUser";
import { findOrFetchUserByKey } from "./user";

jest.mock("./findOrFetchUser");
const mockedById = jest.mocked(findOrFetchUserById);
const mockedByWebFinger = jest.mocked(findOrFetchUserByWebFinger);

const dummyUser = { id: "foo" } as User;

describe("findOrFetchUserByKey", () => {
  test("idの場合はfindOrFetchUserByIdを呼び出す", async () => {
    // arrange
    mockedById.mockResolvedValueOnce(dummyUser);
    // act
    const user = await findOrFetchUserByKey("foo");
    // assert
    expect(user).toBe(dummyUser);
    expect(mockedById).toHaveBeenCalledWith("foo");
  });
  test("@から始まる場合はfindOrFetchUserByWebFingerを呼び出す", async () => {
    // arrange
    mockedByWebFinger.mockResolvedValueOnce(dummyUser);
    // act
    const user = await findOrFetchUserByKey("@foo@remote.example.com");
    // assert
    expect(user).toBe(dummyUser);
    expect(mockedByWebFinger).toHaveBeenCalledWith({
      preferredUsername: "foo",
      host: "remote.example.com",
    });
  });
  test("パースでエラー(リダイレクトなど)が返された場合はそのまま返す", async () => {
    // act
    const user = await findOrFetchUserByKey("@foo@myhost.example.com");
    // assert
    expect(user).toBeInstanceOf(RedirectError);
  });
});
