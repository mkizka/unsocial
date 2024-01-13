import type { Note } from "@prisma/client";

import { apReplayService } from "@/_shared/activitypub/apRelayService";
import { mockedPrisma } from "@/_shared/mocks/prisma";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";

import { action } from "./action";

jest.mock("@/_shared/activitypub/apRelayService");
const mockedRelayActivityToFollowers = jest.mocked(
  apReplayService.relayActivityToFollowers,
);

const dummySessionUserId = "__id";

describe("DeleteButton/action", () => {
  test("正常系", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummySessionUserId);
    mockedPrisma.note.delete.mockResolvedValue({ id: "__noteId" } as Note);
    // act
    await expect(() => action("__noteId")).rejects.toThrow("NEXT_REDIRECT");
    // assert
    expect(mockedRelayActivityToFollowers).toHaveBeenCalledWith({
      userId: dummySessionUserId,
      activity: expect.objectContaining({ type: "Delete" }),
    });
  });
});
