import type { User } from "@prisma/client";
import bcryptjs from "bcryptjs";

import { mockedPrisma } from "@/_mocks/prisma";

import {
  findOrFetchUserById,
  findOrFetchUserByWebFinger,
} from "./findOrFetchUser";
import { authorize, findOrFetchUserByKey } from "./user";

jest.mock("./findOrFetchUser");

describe("userService", () => {
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
  });
  describe("authorize", () => {
    const mockCompareSync = jest.spyOn(bcryptjs, "compareSync");

    test("action = signIn", async () => {
      // arrange
      const dummyForms = {
        action: "signIn",
        preferredUsername: "test",
        password: "password",
      };
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: "userId",
        credential: {
          privateKey: "privateKey",
          hashedPassword: "hashedPassword",
        },
      } as unknown as User);
      mockCompareSync.mockReturnValueOnce(true);
      // act
      const result = await authorize(dummyForms);
      // assert
      expect(result).toEqual({ id: "userId" });
    });
    test("action = signUp", async () => {
      // arrange
      const dummyForms = {
        action: "signUp",
        name: "テスト",
        preferredUsername: "test",
        password: "password",
      };
      mockedPrisma.user.create.mockResolvedValueOnce({
        id: "userId",
        credential: {
          privateKey: "privateKey",
        },
      } as unknown as User);
      // act
      const result = await authorize(dummyForms);
      // assert
      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: "テスト",
          preferredUsername: "test",
          host: "myhost.example.com",
          publicKey: expect.any(String),
          credential: {
            create: {
              hashedPassword: expect.any(String),
              privateKey: expect.any(String),
            },
          },
        },
      });
      expect(result).toEqual({ id: "userId" });
    });
    test("actionが無いとエラー", async () => {
      // arrange
      const dummyForms = {
        preferredUsername: "test",
        password: "password",
      };
      // assert
      await expect(() => authorize(dummyForms)).rejects.toThrow(
        "不正な操作です",
      );
    });
    test("preferredUsernameが空文字だとエラー", async () => {
      // arrange
      const dummyForms = {
        action: "signUp",
        preferredUsername: "",
        password: "password",
      };
      // assert
      await expect(() => authorize(dummyForms)).rejects.toThrow(
        "ユーザーIDは必須です",
      );
    });
    test("passwordが短いとエラー", async () => {
      // arrange
      const dummyForms = {
        action: "signUp",
        preferredUsername: "test",
        password: "p",
      };
      // assert
      await expect(() => authorize(dummyForms)).rejects.toThrow(
        "パスワードは8文字以上にしてください",
      );
    });
    test("指定したpreferredUsernameのユーザーがいないとエラー", async () => {
      // arrange
      const dummyForms = {
        action: "signIn",
        preferredUsername: "test",
        password: "password",
      };
      mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
      // assert
      await expect(() => authorize(dummyForms)).rejects.toThrow(
        "ユーザーが見つかりません",
      );
    });
    test("パスワードが間違っているとエラー", async () => {
      // arrange
      const dummyForms = {
        action: "signIn",
        preferredUsername: "test",
        password: "password",
      };
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: "userId",
        credential: {
          privateKey: "privateKey",
        },
      } as unknown as User);
      mockCompareSync.mockReturnValueOnce(false);
      // assert
      await expect(() => authorize(dummyForms)).rejects.toThrow(
        "パスワードが間違っています",
      );
    });
  });
});