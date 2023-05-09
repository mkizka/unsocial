import type { Note } from "@prisma/client";
import type { Session } from "next-auth";

import { queue } from "@/server/background/queue";
import { getServerSession } from "@/utils/getServerSession";
import { mockedPrisma } from "@/utils/mock";

import { action } from "./action";

jest.mock("@/utils/getServerSession");
const mockedGetServerSession = jest.mocked(getServerSession);

jest.mock("@/server/background/queue");
const mockedQueue = jest.mocked(queue);

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
    const response = await action({ noteId: "__noteId" });
    // assert
    expect(response).toBeUndefined();
    expect(mockedQueue.push).toHaveBeenCalledWith({
      runner: "relayActivity",
      params: {
        sender: dummySessionUser,
        activity: expect.objectContaining({ type: "Delete" }),
      },
    });
  });
});
