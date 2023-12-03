import { format } from "./utils";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-02T00:00:00Z"));

test.each`
  input                     | expected
  ${"2020-01-02T00:00:00Z"} | ${"0秒前"}
  ${"2020-01-01T23:59:01Z"} | ${"59秒前"}
  ${"2020-01-01T23:59:00Z"} | ${"1分前"}
  ${"2020-01-01T23:00:01Z"} | ${"59分前"}
  ${"2020-01-01T23:00:00Z"} | ${"1時間前"}
  ${"2020-01-01T00:00:01Z"} | ${"23時間前"}
  ${"2020-01-01T00:00:00Z"} | ${"2020/1/1"}
`("format(new Date('$input')) == $expected", ({ input, expected }) => {
  expect(format(new Date(input))).toBe(expected);
});
