import type { Note } from "@prisma/client";
import { captor, mockDeep } from "jest-mock-extended";

import { mockedPrisma } from "@/_shared/mocks/prisma";

import { GET } from "./route";

describe("/notes/[noteId]/activity", () => {
  test("GET", async () => {
    // arrange
    const mockedRequest = mockDeep<Request>();
    mockedRequest.headers.get.mockReturnValueOnce("application/activity+json");
    mockedPrisma.note.findFirst.mockResolvedValueOnce({
      id: "noteId",
      userId: "userId",
      content: "content",
      publishedAt: new Date("2021-01-01T00:00:00.000Z"),
    } as Note);
    // act
    const response = await GET(mockedRequest, { params: { noteId: "noteId" } });
    // assert
    const prismaCaptor = captor();
    expect(mockedPrisma.note.findFirst).toHaveBeenCalledWith(prismaCaptor);
    expect(prismaCaptor.value).toEqual({
      select: {
        content: true,
        publishedAt: true,
        id: true,
        userId: true,
        replyTo: {
          select: {
            id: true,
            url: true,
            user: {
              select: {
                actorUrl: true,
              },
            },
          },
        },
      },
      where: {
        id: "noteId",
      },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/activity+json",
    );
    expect(await response.json()).toEqual({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      attributedTo: "https://myhost.example.com/users/userId/activity",
      cc: ["https://myhost.example.com/users/userId/followers"],
      content: "content",
      id: "https://myhost.example.com/notes/noteId/activity",
      url: "https://myhost.example.com/notes/noteId",
      published: "2021-01-01T00:00:00.000Z",
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      type: "Note",
    });
  });
  test("ノートが無かった場合はnotFound()を呼ぶ", async () => {
    mockedPrisma.note.findFirst.mockResolvedValueOnce(null);
    await expect(
      GET({} as Request, { params: { noteId: "noteId" } }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
