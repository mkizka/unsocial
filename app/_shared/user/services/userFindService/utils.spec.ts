import { parseUserKey } from "./utils";

describe("parseKey", () => {
  test.each`
    key                          | expected
    ${"%40foo"}                  | ${{ preferredUsername: "foo", host: "myhost.example.com" }}
    ${"@foo"}                    | ${{ preferredUsername: "foo", host: "myhost.example.com" }}
    ${"@foo@remote.example.com"} | ${{ preferredUsername: "foo", host: "remote.example.com" }}
    ${"@"}                       | ${{ preferredUsername: "", host: "myhost.example.com" }}
    ${"@@"}                      | ${{ preferredUsername: "", host: "" }}
    ${"foo"}                     | ${{ id: "foo" }}
  `("parseKey($key) returns $expected", ({ key, expected }) => {
    expect(parseUserKey(key)).toEqual(expected);
  });
});
