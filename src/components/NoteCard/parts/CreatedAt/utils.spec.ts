import { format } from "./utils";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-02T00:00:00"));

test.each`
  input                    | expected
  ${"2020-01-02T00:00:00"} | ${"0秒前"}
  ${"2020-01-01T23:59:59"} | ${"1秒前"}
  ${"2020-01-01T23:59:00"} | ${"1分前"}
  ${"2020-01-01T23:00:01"} | ${"59分前"}
  ${"2020-01-01T23:00:00"} | ${"1時間前"}
  ${"2020-01-01T00:00:01"} | ${"23時間前"}
  ${"2020-01-01T00:00:00"} | ${"2020/1/1"}
`("format(new Date('$input')) == $expected", ({ input, expected }) => {
  expect(format(new Date(input))).toBe(expected);
});
