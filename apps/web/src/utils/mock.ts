// Stryker disable all
import type { PrismaClient } from "@soshal/database";
import { prisma } from "@soshal/database";
import type { DeepMockProxy } from "jest-mock-extended";
import { mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@soshal/database", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(mockedPrisma);
});

// https://www.prisma.io/docs/guides/testing/unit-testing#mocking-the-prisma-client
export const mockedPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;
