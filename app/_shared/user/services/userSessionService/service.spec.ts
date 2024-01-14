import type { User } from "@prisma/client";
import { getServerSession } from "next-auth";

import { mockedPrisma } from "@/_shared/mocks/prisma";

import { userSessionService } from ".";

jest.mock("next-auth");
const mockedGetServerSession = jest.mocked(getServerSession);

const dummyUser = {
  id: "userId",
} as User;

describe("userSessionService", () => {
  describe("getSessionUserId", () => {
    test("ログイン中のユーザーIDを返す", async () => {
      mockedGetServerSession.mockResolvedValueOnce({
        user: {
          id: "userId",
        },
      });
      const sessionUserId = await userSessionService.getUserId();
      expect(sessionUserId).toBe("userId");
    });
    test("ログイン中でなければnullを返す", async () => {
      mockedGetServerSession.mockResolvedValueOnce(null);
      const sessionUserId = await userSessionService.getUserId();
      expect(sessionUserId).toBe(null);
    });
    test("ログイン中でなく、redirect:trueなら/authにリダイレクトする", async () => {
      mockedGetServerSession.mockResolvedValueOnce(null);
      await expect(() =>
        userSessionService.getUserId({ redirect: true }),
      ).rejects.toThrow("NEXT_REDIRECT");
    });
  });
  describe("getSessionUser", () => {
    test("ログイン中のユーザーを返す", async () => {
      mockedGetServerSession.mockResolvedValueOnce({
        user: {
          id: "userId",
        },
      });
      mockedPrisma.user.findUnique.mockResolvedValueOnce(dummyUser);
      const sessionUser = await userSessionService.getUser();
      expect(sessionUser).toEqual(dummyUser);
    });
    test("ログイン中でなければnullを返す", async () => {
      mockedGetServerSession.mockResolvedValueOnce(null);
      const sessionUser = await userSessionService.getUser();
      expect(sessionUser).toBe(null);
    });
    test("ログイン中でもユーザーが存在しなければnullを返す", async () => {
      mockedGetServerSession.mockResolvedValueOnce({
        user: {
          id: "userId",
        },
      });
      mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
      const sessionUser = await userSessionService.getUser();
      expect(sessionUser).toBe(null);
    });
    test("ログイン中でなく、redirect:trueなら/authにリダイレクトする", async () => {
      mockedGetServerSession.mockResolvedValueOnce(null);
      await expect(() =>
        userSessionService.getUser({ redirect: true }),
      ).rejects.toThrow("NEXT_REDIRECT");
    });
    test("ログイン中でユーザーが存在せず、redirect:trueなら/authにリダイレクトする", async () => {
      mockedGetServerSession.mockResolvedValueOnce({
        user: {
          id: "userId",
        },
      });
      mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(() =>
        userSessionService.getUser({ redirect: true }),
      ).rejects.toThrow("NEXT_REDIRECT");
    });
  });
});
