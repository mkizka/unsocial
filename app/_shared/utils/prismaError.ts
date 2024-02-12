import type { Prisma } from "@prisma/client";

// jest-prismaでprismaのエラーが判別できない問題の回避策
// 関連: https://zenn.dev/hid3/scraps/b897e2d9832582
export const isInstanceOfPrismaError = (
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError => {
  return typeof error === "object" && error !== null && "code" in error;
};
