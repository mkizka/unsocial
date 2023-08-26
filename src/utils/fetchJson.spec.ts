import { rest } from "msw";

import { mockedLogger } from "@/mocks/logger";
import { server } from "@/mocks/server";

import {
  fetchJson,
  JSONParseError,
  NotOKError,
  TimeoutError,
} from "./fetchJson";

const dummyUrl = "https://remote.example.com/api";

describe("fetchJson", () => {
  test("正常系", async () => {
    // arrange
    const headerFn = jest.fn();
    server.use(
      rest.get(dummyUrl, async (req, res, ctx) => {
        headerFn(req.headers.all());
        return res.once(ctx.json({ success: true }));
      }),
    );
    // act
    const response = await fetchJson(dummyUrl);
    // assert
    expect(mockedLogger.info).toHaveBeenNthCalledWith(
      1,
      `fetch(${dummyUrl}): 開始`,
    );
    expect(mockedLogger.info).toHaveBeenNthCalledWith(
      2,
      `fetch(${dummyUrl}): {"success":true}`,
    );
    expect(response).toEqual({ success: true });
  });
  test("レスポンスがテキストだったとき", async () => {
    // arrange
    server.use(
      rest.get(dummyUrl, (req, res, ctx) => {
        return res.once(ctx.text("OK"));
      }),
    );
    // act
    const response = await fetchJson(dummyUrl);
    // assert
    expect(mockedLogger.info).toHaveBeenNthCalledWith(
      1,
      `fetch(${dummyUrl}): 開始`,
    );
    expect(mockedLogger.info).toHaveBeenNthCalledWith(
      2,
      `fetch(${dummyUrl}): OK`,
    );
    expect(response).toBeInstanceOf(JSONParseError);
  });
  test("POST", async () => {
    // arrange
    const headerFn = jest.fn();
    const bodyFn = jest.fn();
    server.use(
      rest.post(dummyUrl, async (req, res, ctx) => {
        headerFn(req.headers.all());
        bodyFn(await req.json());
        return res.once(ctx.json({ success: true }));
      }),
    );
    // act
    const response = await fetchJson(dummyUrl, {
      method: "POST",
      body: JSON.stringify({ foo: "bar" }),
      headers: {
        bar: "baz",
      },
    });
    // assert
    expect(mockedLogger.info).toHaveBeenNthCalledWith(
      1,
      `fetch(${dummyUrl}): 開始`,
    );
    expect(mockedLogger.info).toHaveBeenNthCalledWith(
      2,
      `fetch(${dummyUrl}): {"success":true}`,
    );
    expect(headerFn.mock.calls[0][0]).toEqual({
      bar: "baz",
      "content-type": "application/json",
    });
    expect(bodyFn.mock.calls[0][0]).toEqual({ foo: "bar" });
    expect(response).toEqual({ success: true });
  });
  test("HTTPエラー", async () => {
    // arrange
    server.use(
      rest.get(dummyUrl, (req, res, ctx) => {
        return res.once(ctx.status(400));
      }),
    );
    // act
    const response = await fetchJson(dummyUrl);
    // assert
    expect(mockedLogger.warn).toBeCalledWith(
      `fetchエラー(${dummyUrl}): NotOKError`,
    );
    expect(response).toBeInstanceOf(NotOKError);
  });
  test("タイムアウト", async () => {
    // arrange
    server.use(
      rest.get(dummyUrl, (_, res, ctx) => {
        return res.once(ctx.delay(3000), ctx.json({ success: false }));
      }),
    );
    // act
    const response = await fetchJson(dummyUrl, { timeout: 1 });
    // assert
    expect(mockedLogger.warn).toBeCalledWith(
      `fetchエラー(${dummyUrl}): TimeoutError`,
    );
    expect(response).toBeInstanceOf(TimeoutError);
  });
});
