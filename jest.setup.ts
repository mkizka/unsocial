import { server } from "./src/mocks/server";

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

jest.mock("@/app/_shared/libs/util/env", () => ({
  env: {
    ...process.env,
    HOST: "myhost.example.com",
  },
}));
