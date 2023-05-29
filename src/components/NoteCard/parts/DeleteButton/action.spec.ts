import type { Note } from "@prisma/client";
import type { Session } from "next-auth";

import { getServerSession } from "@/utils/getServerSession";
import { mockedPrisma } from "@/utils/mock";
import { relayActivity } from "@/utils/relayActivity";

import { action } from "./action";

jest.mock("@/utils/getServerSession");
const mockedGetServerSession = jest.mocked(getServerSession);

jest.mock("@/utils/relayActivity");
const mockedRelayActivity = jest.mocked(relayActivity);

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
    const response = await action("__noteId");
    // assert
    expect(response).toBeUndefined();
    expect(mockedRelayActivity).toHaveBeenCalledWith({
      sender: dummySessionUser,
      activity: expect.objectContaining({ type: "Delete" }),
    });
  });
});
