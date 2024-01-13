import type { Note } from "@prisma/client";

import { mockedPrisma } from "@/_mocks/prisma";
import { mockedGetSessionUserId } from "@/_mocks/session";
import { relayActivityToFollowers } from "@/_shared/utils/relayActivity";

import { action } from "./action";

jest.useFakeTimers();
jest.setSystemTime(new Date("2023-01-01T00:00:00Z"));

jest.mock("@/_shared/utils/relayActivity");
const mockedRelayActivityToFollowers = jest.mocked(relayActivityToFollowers);

const dummySessionUserId = "__session__user__id";

describe("NoteForm/action", () => {
  test("正常系", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummySessionUserId);
    mockedPrisma.note.create.mockResolvedValue({
      id: "__noteId",
      userId: "__note__userId",
      content: "テスト",
      replies: [],
      user: {
        host: "myhost.example.com",
        preferredUsername: "test",
      },
      attachments: [],
      likes: [],
    } as unknown as Note);
    // act
    const form = new FormData();
    form.append("content", "テスト");
    form.append("replyToId", "__replyToId");
    const response = await action(form);
    // assert
    expect(response).toBeUndefined();
    expect(mockedPrisma.note.create).toHaveBeenCalledWith({
      data: {
        attachments: {
          create: [],
        },
        content: "テスト",
        publishedAt: new Date("2023-01-01T00:00:00.000Z"),
        replyToId: "__replyToId",
        userId: "__session__user__id",
      },
      include: expect.any(Object),
    });
    expect(mockedRelayActivityToFollowers).toHaveBeenCalledWith({
      userId: dummySessionUserId,
      activity: expect.objectContaining({ type: "Create" }),
    });
  });
  test("入力したデータが不正な場合はエラーを返す", async () => {
    // arrange
    mockedGetSessionUserId.mockResolvedValue(dummySessionUserId);
    // act
    const form = new FormData();
    const response = await action(form);
    // assert
    expect(response).toEqual({ error: "フォームの内容が不正です" });
  });
});