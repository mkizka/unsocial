import { execSync } from "child_process";

import { server } from "./app/_shared/mocks/server";

// https://www.mizdra.net/entry/2022/11/24/153459
process.env.UNSOCIAL_DATABASE_URL = `postgresql://postgres:password@localhost:5432/unsocial_jest${process.env.JEST_WORKER_ID}`;

// https://github.com/Quramy/jest-prisma#tips
jest.mock("@/_shared/utils/prisma", () => ({
  prisma: jestPrisma.client,
}));

beforeAll(() => {
  execSync("pnpm prisma db push --skip-generate", { env: process.env });
  server.listen({
    onUnhandledRequest: (req, print) => {
      // utils/fetcher.ts のタイムアウトテストで使用
      if (req.url.toString() === "http://localhost:3001/") {
        return;
      }
      print.error();
    },
  });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

jest.mock("@/_shared/utils/env", () => ({
  env: {
    ...process.env,
    UNSOCIAL_HOST: "myhost.example.com",
  },
}));
