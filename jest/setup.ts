import { server } from "@/_shared/mocks/server";

// https://github.com/Quramy/jest-prisma#tips
jest.mock("@/_shared/utils/prisma", () => ({
  prisma: jestPrisma.client,
}));

beforeAll(() =>
  server.listen({
    onUnhandledRequest: (req, print) => {
      // utils/fetcher.ts のタイムアウトテストで使用
      if (req.url.toString() === "http://localhost:3001/") {
        return;
      }
      print.error();
    },
  }),
);

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

jest.mock("@/_shared/utils/env", () => ({
  env: {
    ...process.env,
    UNSOCIAL_HOST: "myhost.example.com",
  },
}));
