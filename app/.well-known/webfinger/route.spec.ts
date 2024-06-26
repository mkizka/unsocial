import type { User } from "@prisma/client";
import type { NextRequest } from "next/server";

import { mockedPrisma } from "@/_shared/mocks/prisma";

import { GET } from "./route";

const createDummyRequest = (params: Record<string, string>) => {
  return {
    nextUrl: {
      searchParams: new URLSearchParams(params),
    },
  } as unknown as NextRequest;
};

describe("/.well-known/webfinger", () => {
  test("GET", async () => {
    // arrange
    mockedPrisma.user.findUnique.mockResolvedValue({
      id: "foo",
    } as User);
    const dummyRequest = createDummyRequest({
      resource: "acct:test@myhost.example.com",
    });
    // act
    const response = await GET(dummyRequest);
    // assert
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/jrd+json");
    expect(mockedPrisma.user.findUnique).toBeCalledWith({
      where: {
        preferredUsername_host: {
          preferredUsername: "test",
          host: "myhost.example.com",
        },
      },
    });
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "links": [
          {
            "href": "https://myhost.example.com/users/foo/activity",
            "rel": "self",
            "type": "application/activity+json",
          },
        ],
        "subject": "acct:test@myhost.example.com",
      }
    `);
  });
  test("resourceパラメータが不正ならnotFoundを返す", async () => {
    mockedPrisma.user.findFirst.mockResolvedValue({
      id: "foo",
    } as User);
    const dummyRequest = createDummyRequest({
      resource: "test@myhost.example.com",
    });
    await expect(GET(dummyRequest)).rejects.toThrow("NEXT_NOT_FOUND");
  });
  test("ユーザーが見つからなければnotFoundを返す", async () => {
    mockedPrisma.user.findFirst.mockResolvedValue(null);
    const dummyRequest = createDummyRequest({
      resource: "acct:test@myhost.example.com",
    });
    await expect(GET(dummyRequest)).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
