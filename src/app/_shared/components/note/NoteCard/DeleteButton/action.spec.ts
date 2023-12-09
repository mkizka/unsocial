import type { Note } from "@prisma/client";
import type { Session } from "next-auth";

import { mockedPrisma } from "@/app/_mocks/prisma";
import { getServerSession } from "@/app/_shared/utils/getServerSession";
import { relayActivityToFollowers } from "@/app/_shared/utils/relayActivity";

import { action } from "./action";

jest.mock("@/app/_shared/utils/getServerSession");
const mockedGetServerSession = jest.mocked(getServerSession);

jest.mock("@/app/_shared/utils/relayActivity");
const mockedRelayActivityToFollowers = jest.mocked(relayActivityToFollowers);

const dummySessionUser = {
  id: "__id",
};

describe("DeleteButton/action", () => {
  test("正常系", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({
      user: dummySessionUser,
    } as Session);
    mockedPrisma.note.delete.mockResolvedValue({ id: "__noteId" } as Note);
    // act
    await expect(() => action("__noteId")).rejects.toThrow("NEXT_REDIRECT");
    // assert
    expect(mockedRelayActivityToFollowers).toHaveBeenCalledWith({
      userId: dummySessionUser.id,
      activity: expect.objectContaining({ type: "Delete" }),
    });
  });
});
