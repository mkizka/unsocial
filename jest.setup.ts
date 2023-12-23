import { server } from "./app/_mocks/server";

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
