import { server } from "./src/mocks/server";

beforeAll(() =>
  server.listen({
    onUnhandledRequest: (req) => {
      const url = req.url.toString();
      // utils/fetcher.ts のタイムアウトテストで使用
      if (url === "http://localhost:3001/") {
        return;
      }
      console.error(
        "mswでモックされていないURLへのリクエストが行われました: " + url,
      );
      throw new Error();
    },
  }),
);

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

jest.mock("@/utils/env", () => ({
  env: {
    ...process.env,
    HOST: "myhost.example.com",
  },
}));
