import { RedirectError, UserNotFoundError } from "./errors";
import { parseUserKey } from "./parseUserKey";

describe("parseKey", () => {
  test.each`
    key                          | expected
    ${"%40foo"}                  | ${{ preferredUsername: "foo", host: "myhost.example.com" }}
    ${"@foo"}                    | ${{ preferredUsername: "foo", host: "myhost.example.com" }}
    ${"@foo@remote.example.com"} | ${{ preferredUsername: "foo", host: "remote.example.com" }}
    ${"foo"}                     | ${{ id: "foo" }}
  `("parseKey($key) returns $expected", ({ key, expected }) => {
    expect(parseUserKey(key)).toEqual(expected);
  });
  test("入力が@のみならnotFound", () => {
    expect(parseUserKey("@")).toBeInstanceOf(UserNotFoundError);
  });
  test("env.HOSTと一致する場合はhostを消してリダイレクト", () => {
    const error = parseUserKey("@foo@myhost.example.com");
    expect(error).toBeInstanceOf(RedirectError);
    expect((error as RedirectError).url).toBe("/@foo");
  });
});
