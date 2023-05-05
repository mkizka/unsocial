import nock from "nock";

nock.disableNetConnect();

beforeEach(() => {
  nock.cleanAll();
});

jest.mock("@/utils/env", () => ({
  env: {
    ...process.env,
    HOST: "myhost.example.com",
  },
}));
