import { fetcher } from "./fetcher";

const mockedFetch = jest.spyOn(global, "fetch");

describe("fetcher", () => {
  test("正常系", async () => {
    // arrange
    mockedFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ok" }))
    );
    // act
    const response = await fetcher("https://example.com");
    // assert
    expect(mockedFetch).toBeCalledWith("https://example.com", {
      headers: { "Content-Type": "application/json" },
    });
    expect(response).toEqual({ status: "ok" });
  });
});
