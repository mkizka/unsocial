import { parseKeyOrRedirect } from "./parseKey";

describe("parseKey", () => {
  test.each`
    key                          | expected
    ${"%40foo"}                  | ${{ preferredUsername: "foo", host: "myhost.example.com" }}
    ${"@foo"}                    | ${{ preferredUsername: "foo", host: "myhost.example.com" }}
    ${"@foo@remote.example.com"} | ${{ preferredUsername: "foo", host: "remote.example.com" }}
    ${"foo"}                     | ${{ userId: "foo" }}
  `("parseKey($key) returns $expected", ({ key, expected }) => {
    expect(parseKeyOrRedirect(key)).toEqual(expected);
  });
  test("入力が@のみならnotFound", () => {
    expect(() => parseKeyOrRedirect("@")).toThrowError("NEXT_NOT_FOUND");
  });
  test("env.HOSTと一致する場合はhostを消してリダイレクト", () => {
    expect(() => parseKeyOrRedirect("@foo@myhost.example.com")).toThrowError(
      "NEXT_REDIRECT",
    );
  });
});
