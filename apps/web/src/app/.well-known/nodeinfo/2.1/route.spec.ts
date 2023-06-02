import { mockedPrisma } from "@/utils/mock";

import { GET } from "./route";

describe("/.well-known/nodeinfo", () => {
  test("GET", async () => {
    // arrange
    mockedPrisma.user.count.mockResolvedValue(10);
    mockedPrisma.note.count.mockResolvedValue(20);
    // act
    const response = await GET();
    // assert
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/jrd+json");
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "metadata": {},
        "openRegistrations": true,
        "protocols": [
          "activitypub",
        ],
        "services": {
          "inbound": [],
          "outbound": [],
        },
        "software": {
          "homepage": "https://github.com/mkizka/soshal",
          "name": "soshal",
          "repository": "https://github.com/mkizka/soshal.git",
          "version": "0.0.1",
        },
        "usage": {
          "localComments": 0,
          "localPosts": 20,
          "users": {
            "activeHalfyear": null,
            "activeMonth": null,
            "total": 10,
          },
        },
        "version": "2.1",
      }
    `);
  });
});
