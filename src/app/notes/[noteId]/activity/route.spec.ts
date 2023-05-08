import type { Note } from "@prisma/client";

import { mockedPrisma } from "@/utils/mock";

import { GET } from "./route";

describe("/notes/[noteId]/activity", () => {
  test("GET", async () => {
    // arrange
    mockedPrisma.note.findFirst.mockResolvedValueOnce({
      id: "noteId",
      userId: "userId",
      content: "content",
      createdAt: new Date("2021-01-01T00:00:00.000Z"),
    } as Note);
    // act
    const response = await GET({} as Request, { params: { noteId: "noteId" } });
    // assert
    expect(mockedPrisma.note.findFirst.mock.lastCall?.[0])
      .toMatchInlineSnapshot(`
      {
        "select": {
          "content": true,
          "createdAt": true,
          "id": true,
          "userId": true,
        },
        "where": {
          "id": "noteId",
        },
      }
    `);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/activity+json"
    );
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          "https://w3id.org/security/v1",
        ],
        "attributedTo": "https://myhost.example.com/users/userId/activity",
        "cc": [
          "https://myhost.example.com/users/userId/activity/followers",
        ],
        "content": "content",
        "id": "https://myhost.example.com/notes/noteId/activity",
        "published": "2021-01-01T00:00:00.000Z",
        "to": [
          "https://www.w3.org/ns/activitystreams#Public",
        ],
        "type": "Note",
      }
    `);
  });
  test("ノートが無かった場合はnotFound()を呼ぶ", async () => {
    mockedPrisma.note.findFirst.mockResolvedValueOnce(null);
    await expect(
      GET({} as Request, { params: { noteId: "noteId" } })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
