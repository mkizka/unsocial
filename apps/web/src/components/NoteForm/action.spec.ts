import type { Note } from "@soshal/database";
import type { Session } from "next-auth";

import { getServerSession } from "@/utils/getServerSession";
import { mockedPrisma } from "@/utils/mock";
import { relayActivity } from "@/utils/relayActivity";

import { action } from "./action";

jest.mock("@/utils/getServerSession");
const mockedGetServerSession = jest.mocked(getServerSession);

jest.mock("@/utils/relayActivity");
const mockedRelayActivity = jest.mocked(relayActivity);

describe("NoteForm/action", () => {
  test("正常系", async () => {
    // arrange
    const dummySession = { user: { id: "__session__user__id" } };
    mockedGetServerSession.mockResolvedValue(dummySession as Session);
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
    expect(mockedRelayActivity).toHaveBeenCalledWith(
      dummySession.user.id,
      expect.objectContaining({ type: "Create" })
    );
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
