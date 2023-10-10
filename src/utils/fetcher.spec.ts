import http from "http";
import { captor, mockDeep } from "jest-mock-extended";
import { rest } from "msw";
import { setTimeout } from "timers/promises";

import { mockedLogger } from "@/mocks/logger";
import { server } from "@/mocks/server";

import { fetcher, FetcherError, NotOKError } from "./fetcher";

const dummyUrl = "https://remote.example.com/api";

jest.mock("@/../package.json", () => ({
  version: "1.2.3",
}));

const mockedPerformance = mockDeep<typeof performance>();
mockedPerformance.now.mockReturnValue(0);
performance = mockedPerformance;

describe("fetcher", () => {
  test("正常系", async () => {
    // arrange
    const headerFn = jest.fn();
    const headerCaptor = captor();
    server.use(
      rest.get(dummyUrl, async (req, res, ctx) => {
        headerFn(req.headers.all());
        return res.once(ctx.json({ success: true }));
      }),
    );
    // act
    const response = (await fetcher(dummyUrl)) as Response;
    // assert
    expect(headerFn).toBeCalledWith(headerCaptor);
    expect(headerCaptor.value).toEqual({
      "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
    });
    expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    expect(mockedLogger.info).toHaveBeenCalledWith(
      `fetch(GET ${dummyUrl}): 200 OK (0ms)`,
    );
    expect(await response.json()).toEqual({ success: true });
  });
  test("POST", async () => {
    // arrange
    const headerFn = jest.fn();
    const headerCaptor = captor();
    const bodyFn = jest.fn();
    const bodyCaptor = captor();
    server.use(
      rest.post(dummyUrl, async (req, res, ctx) => {
        headerFn(req.headers.all());
        bodyFn(await req.json());
        return res.once(ctx.json({ success: true }));
      }),
    );
    // act
    const response = (await fetcher(dummyUrl, {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
      headers: {
        bar: "baz",
      },
    })) as Response;
    // assert
    expect(headerFn).toHaveBeenCalledWith(headerCaptor);
    expect(headerCaptor.value).toEqual({
      bar: "baz",
      "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
      "content-type": "application/json",
    });
    expect(bodyFn).toHaveBeenCalledWith(bodyCaptor);
    expect(bodyCaptor.value).toEqual({ foo: "bar" });
    expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    expect(mockedLogger.info).toHaveBeenCalledWith(
      `fetch(POST ${dummyUrl}): 200 OK (0ms)`,
    );
    expect(await response.json()).toEqual({ success: true });
  });
  test("HTTPエラー", async () => {
    // arrange
    server.use(
      rest.get(dummyUrl, (req, res, ctx) => {
        return res.once(ctx.status(400));
      }),
    );
    // act
    const response = await fetcher(dummyUrl);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledTimes(1);
    expect(mockedLogger.info).toHaveBeenCalledWith(
      `fetch(GET ${dummyUrl}): 400 Bad Request (0ms)`,
    );
    expect(response).toBeInstanceOf(NotOKError);
  });
  test("ネットワークエラー", async () => {
    // arrange
    // net::ERR_FAILEDのログが出るので抑制する
    const mockedConsoleError = jest
      .spyOn(console, "error")
      .mockImplementation();
    server.use(
      rest.get(dummyUrl, (_, res) => {
        return res.networkError("Failed to connect");
      }),
    );
    // act
    const response = await fetcher(dummyUrl);
    // assert
    expect(mockedLogger.warn).toBeCalledWith(
      `fetchエラー(GET ${dummyUrl}): Failed to fetch`,
    );
    expect(response).toBeInstanceOf(Error);
    mockedConsoleError.mockRestore();
  });
  test("タイムアウト", async () => {
    // arrange
    // mswではなぜかモック出来なかった
    const server = http.createServer(async (_, res) => {
      await setTimeout(3000);
      res.end();
    });
    await new Promise<void>((resolve) => {
      server.listen(3001, () => resolve());
    });
    // act
    const response = await fetcher("http://localhost:3001", { timeout: 1 });
    // assert
    expect(mockedLogger.warn).toBeCalledWith(
      `fetchエラー(GET http://localhost:3001): This operation was aborted`,
    );
    expect(response).toBeInstanceOf(FetcherError);
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });
});
