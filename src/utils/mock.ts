// Stryker disable all
import type { PrismaClient } from "@prisma/client";
import type { DeepMockProxy } from "jest-mock-extended";
import { mockDeep, mockReset } from "jest-mock-extended";

import { prisma } from "@/utils/prisma";

jest.mock("@/utils/prisma", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(mockedPrisma);
});

// https://www.prisma.io/docs/guides/testing/unit-testing#mocking-the-prisma-client
export const mockedPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;
