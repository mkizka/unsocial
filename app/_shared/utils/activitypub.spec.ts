import { mockDeep } from "jest-mock-extended";
import type { headers } from "next/headers";

import { shouldReturnActivityStreams } from "./activitypub";

const mockedHeaders = mockDeep<ReturnType<typeof headers>>();
jest.mock("next/headers", () => {
  return {
    headers: () => mockedHeaders,
  };
});

describe("activitypub", () => {
  describe("shouldReturnActivityStreams", () => {
    test("application/activity+jsonを受け取った場合はtrueを返す", () => {
      // arrange
      mockedHeaders.get.mockReturnValue("application/activity+json");
      // act
      const result = shouldReturnActivityStreams();
      // assert
      expect(result).toBe(true);
    });
    test(`application/ld+json; profile="https://www.w3.org/ns/activitystreams"を受け取った場合はtrueを返す`, () => {
      // arrange
      mockedHeaders.get.mockReturnValue(
        `application/ld+json; profile="https://www.w3.org/ns/activitystreams"`,
      );
      // act
      const result = shouldReturnActivityStreams();
      // assert
      expect(result).toBe(true);
    });
    test("それ以外のAcceptに対してはfalseを返せす", () => {
      // arrange
      mockedHeaders.get.mockReturnValue("text/html");
      // act
      const result = shouldReturnActivityStreams();
      // assert
      expect(result).toBe(false);
    });
  });
});
