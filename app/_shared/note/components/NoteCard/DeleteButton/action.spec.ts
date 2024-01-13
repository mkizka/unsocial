import type { Note } from "@prisma/client";

import { mockedPrisma } from "@/_mocks/prisma";
import { mockedGetSessionUserId } from "@/_mocks/session";
import { relayActivityToFollowers } from "@/_shared/utils/relayActivity";

import { action } from "./action";

jest.mock("@/_shared/utils/relayActivity");
const mockedRelayActivityToFollowers = jest.mocked(relayActivityToFollowers);

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
