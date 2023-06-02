jest.mock("@/utils/env", () => ({
  env: {
    ...process.env,
    HOST: "myhost.example.com",
  },
}));
