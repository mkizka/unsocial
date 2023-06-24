import { shouldReFetch } from "./shared";

jest.useFakeTimers();
jest.setSystemTime(new Date("2023-01-01T03:00:00Z"));

describe("shared", () => {
  describe("shouldReFetch", () => {
    test.each`
      user                                                   | expected | description
      ${{ host: "myhost.example.com" }}                      | ${false} | ${"ローカルユーザーならfalse"}
      ${{ lastFetchedAt: null }}                             | ${true}  | ${"lastFetchedAtがnullならtrue(異常な動作)"}
      ${{ lastFetchedAt: new Date("2023-01-01T00:00:00Z") }} | ${true}  | ${"lastFetchedAtから時間が経っていればtrue"}
      ${{ lastFetchedAt: new Date("2023-01-01T00:00:01Z") }} | ${false} | ${"lastFetchedAtから時間が経っていなければfalse"}
    `("$description", ({ user, expected }) => {
      expect(shouldReFetch(user)).toBe(expected);
    });
  });
});
