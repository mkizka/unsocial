import { mockedPrisma } from "@/utils/mock";

import { GET } from "./route";

describe("/.well-known/webfinger", () => {
  test("GET", async () => {
    // arrange
    // @ts-expect-error
    mockedPrisma.user.findFirst.mockResolvedValue({
      id: "foo",
    });
    const dummyRequest = {
      nextUrl: {
        searchParams: new URLSearchParams(
          "resource=acct:test@myhost.example.com"
        ),
      },
    };
    // act
    // @ts-expect-error
    const response = await GET(dummyRequest);
    // assert
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/jrd+json");
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
});
