import { server } from "@/mocks/server";

beforeAll(() =>
  server.listen({
    onUnhandledRequest: "error",
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
