import { http, HttpResponse } from "msw";

import { server } from "@/_shared/mocks/server";

import { fetchActivity } from "./service";

describe("fetchActivity", () => {
  test("指定されたURLからActivityを取得する", async () => {
    // arrange
    const headerFn = jest.fn();
    server.use(
      http.get("https://example.com/actor", ({ request }) => {
        headerFn(Object.fromEntries(request.headers));
        return HttpResponse.json({ type: "Dummy" });
      }),
    );
    // act
    const result = await fetchActivity("https://example.com/actor");
    // assert
    expect(headerFn).toHaveBeenCalledWith({
      accept: "application/activity+json",
      date: expect.any(String),
      digest: expect.any(String),
      host: "example.com",
      signature: expect.any(String),
      "user-agent": expect.any(String),
    });
    expect(result).toEqual({ type: "Dummy" });
  });
  test("通信に失敗した場合はエラーを返す", async () => {
    // arrange
    server.use(
      http.get("https://example.com/actor", () => {
        return HttpResponse.error();
      }),
    );
    // act
    const result = await fetchActivity("https://example.com/actor");
    // assert
    expect(result).toBeInstanceOf(Error);
  });
  test("JSON以外が返された場合はエラーを返す", async () => {
    // arrange
    server.use(
      http.get("https://example.com/actor", () => {
        return HttpResponse.text("<!DOCTYPE html>");
      }),
    );
    // act
    const result = await fetchActivity("https://example.com/actor");
    // assert
    expect(result).toBeInstanceOf(Error);
  });
});
