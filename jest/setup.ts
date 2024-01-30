import { diff } from "jest-diff";

import { server } from "@/_shared/mocks/server";

// https://github.com/Quramy/jest-prisma#tips
jest.mock("@/_shared/utils/prisma", () => ({
  prisma: jestPrisma.client,
}));

// prisma
const isObject = (obj: unknown) => typeof obj === "object" && obj !== null;
expect.extend({
  toEqualPrisma(received, expected) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformDates = (obj: Record<string, any>) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key]?.toISOString) {
            obj[key] = obj[key].toISOString();
          } else if (isObject(obj[key])) {
            transformDates(obj[key]);
          }
        }
      }
    };
    transformDates(received);
    transformDates(expected);
    const pass = this.equals(received, expected);
    const message = pass
      ? () => `Prismaオブジェクトが一致しました`
      : () => {
          const diffString = diff(expected, received);
          return `Prismaオブジェクトが一致しませんでした:\n\n${diffString}`;
        };
    return { message, pass };
  },
});
expect.anyDate = () => {
  return expect.stringMatching(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{1,3}Z$/,
  );
};

// msw
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

// env
jest.mock("@/_shared/utils/env", () => ({
  env: {
    ...process.env,
    UNSOCIAL_HOST: "myhost.example.com",
  },
}));
