import type { Note } from "@prisma/client";
import type { Session } from "next-auth";

import { getServerSession } from "@/utils/getServerSession";
import { mockedPrisma } from "@/utils/mock";
import { relayActivityToFollowers } from "@/utils/relayActivity";

import { action } from "./action";

jest.mock("@/utils/getServerSession");
const mockedGetServerSession = jest.mocked(getServerSession);

jest.mock("@/utils/relayActivity");
const mockedRelayActivityToFollowers = jest.mocked(relayActivityToFollowers);

describe("NoteForm/action", () => {
  test("正常系", async () => {
    // arrange
    const dummySession = { user: { id: "__session__user__id" } } as Session;
    mockedGetServerSession.mockResolvedValue(dummySession);
    mockedPrisma.note.create.mockResolvedValue({
      id: "__noteId",
      userId: "__note__userId",
      content: "テスト",
    } as Note);
    // act
    const form = new FormData();
    form.append("content", "テスト");
    const response = await action(form);
    // assert
    expect(response).toBeUndefined();
    expect(mockedRelayActivityToFollowers).toHaveBeenCalledWith({
      sender: dummySession.user,
      activity: expect.objectContaining({ type: "Create" }),
    });
  });
  test("ログインしていない場合はエラーを返す", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue(null);
    // act
    const form = new FormData();
    form.append("content", "テスト");
    const response = await action(form);
    // assert
    expect(response).toEqual({ error: "ログインが必要です" });
  });
  test("入力したデータが不正な場合はエラーを返す", async () => {
    // arrange
    mockedGetServerSession.mockResolvedValue({ user: {} } as Session);
    // act
    const form = new FormData();
    const response = await action(form);
    // assert
    expect(response).toEqual({ error: "入力したデータが不正です" });
  });
});
