// Stryker disable all
import type { PrismaClient } from "@soshal/database";
import { mockDeep, mockReset } from "jest-mock-extended";

const mockedPrisma = mockDeep<PrismaClient>();

jest.mock("@soshal/database", () => ({
  prisma: mockedPrisma,
}));

beforeEach(() => {
  mockReset(mockedPrisma);
});

export { mockedPrisma };
