import type { Note, User } from "@prisma/client";

import { userService } from "@/app/_shared/service/user";
import { mockedPrisma } from "@/mocks/prisma";

import { GET } from "./route";

jest.mock("@/app/_shared/service/user");
const mockedFindOrFetchUserByKey = jest.mocked(
  userService.findOrFetchUserByKey,
);

describe("/users/[userId]/collections/featured", () => {
  test("GET", async () => {
    // arrange
    mockedFindOrFetchUserByKey.mockResolvedValueOnce({
      id: "__user__id",
    } as User);
    mockedPrisma.note.findMany.mockResolvedValueOnce([
      {
        id: "__note__id",
        userId: "__note__userId",
        content: "__note__content",
        createdAt: new Date("2023-01-01T00:00:00Z"),
      } as Note,
    ]);
    // act
    const response = await GET({} as Request, { params: { userKey: "foo" } });
    // assert
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/activity+json",
    );
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
        ],
        "id": "https://myhost.example.com/users/__user__id/collections/featured",
        "orderedItems": [
          {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              "https://w3id.org/security/v1",
            ],
            "attributedTo": "https://myhost.example.com/users/__note__userId/activity",
            "cc": [
              "https://myhost.example.com/users/__note__userId/followers",
            ],
            "content": "__note__content",
            "id": "https://myhost.example.com/notes/__note__id/activity",
            "published": "2023-01-01T00:00:00.000Z",
            "to": [
              "https://www.w3.org/ns/activitystreams#Public",
            ],
            "type": "Note",
          },
        ],
        "totalItems": 1,
        "type": "OrderedCollection",
      }
    `);
  });
});
