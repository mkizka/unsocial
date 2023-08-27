import type { Note } from "@prisma/client";
import type { Session } from "next-auth";

import { mockedPrisma } from "@/mocks/prisma";
import { getServerSession } from "@/utils/getServerSession";
import { relayActivityToFollowers } from "@/utils/relayActivity";

import { action } from "./action";

jest.useFakeTimers();
jest.setSystemTime(new Date("2023-01-01T00:00:00Z"));

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
    expect(mockedPrisma.note.create.mock.lastCall?.[0]).toMatchInlineSnapshot(`
      {
        "data": {
          "content": "テスト",
          "publishedAt": 2023-01-01T00:00:00.000Z,
          "userId": "__session__user__id",
        },
      }
    `);
    expect(response).toBeUndefined();
    expect(mockedRelayActivityToFollowers).toHaveBeenCalledWith({
      userId: dummySession.user.id,
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
