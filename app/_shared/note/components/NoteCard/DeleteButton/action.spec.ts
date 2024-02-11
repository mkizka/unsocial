import { apReplayService } from "@/_shared/activitypub/apRelayService";
import { LocalNoteFactory } from "@/_shared/factories/note";
import { LocalUserFactory } from "@/_shared/factories/user";
import { mockedGetSessionUserId } from "@/_shared/mocks/session";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";

jest.mock("@/_shared/activitypub/apRelayService");
const mockedRelay = jest.mocked(apReplayService.relay);

describe("DeleteButton/action", () => {
  test("指定したノートを削除する", async () => {
    // arrange
    const user = await LocalUserFactory.createForConnect();
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const note = await LocalNoteFactory.create({
      user: {
        connect: user,
      },
    });
    // act
    await action(note.id);
    // assert
    expect(await prisma.note.findFirst()).toBeNull();
    expect(mockedRelay).toHaveBeenCalledWith({
      userId: user.id,
      activity: expect.objectContaining({ type: "Delete" }),
    });
  });
  test("指定したノートがログインユーザーのもので無ければエラーを返す", async () => {
    // arrange
    const user = await LocalUserFactory.create();
    mockedGetSessionUserId.mockResolvedValue(user.id);
    const anotherNote = await LocalNoteFactory.create();
    // act
    await expect(() => action(anotherNote.id)).rejects.toMatchObject({
      code: "P2025",
    });
    // assert
    expect(await prisma.note.findFirst()).not.toBeNull();
    expect(mockedRelay).not.toHaveBeenCalled();
  });
});
