import type { Note, User } from "@prisma/client";
import { http, HttpResponse } from "msw";

import { mockedKeys } from "@/_mocks/keys";
import { mockedPrisma } from "@/_mocks/prisma";
import { server } from "@/_mocks/server";
import { userService } from "@/_shared/service/user";
import { systemUserService } from "@/_shared/user/services/systemUser";
import { NotOKError } from "@/_shared/utils/fetcher";

import { noteFindService } from ".";

const dummyLocalNote = {
  id: "dummyNoteId",
  url: "https://myhost.example.com/notes/dummyNoteId/activity",
  content: "content",
  userId: "dummyUserId",
  publishedAt: new Date("2023-01-01T00:00:00.000Z"),
};

const dummyRemoteNote = {
  id: "dummyNoteId",
  url: "https://remote.example.com/notes/dummyNoteId",
  content: "content",
  userId: "dummyUserId",
  publishedAt: new Date("2023-01-01T00:00:00.000Z"),
};

const dummyRemoteNoteActivity = {
  type: "Note",
  id: "https://remote.example.com/notes/dummyNoteId",
  attributedTo: "https://remote.example.com/u/dummyUser",
  content: "content",
  published: "2023-01-01T00:00:00.000Z",
};

const ノートがDBに存在しない = () => {
  mockedPrisma.note.findUnique.mockResolvedValue(null);
};

const ローカルのノートがDBに存在する = () => {
  mockedPrisma.note.findUnique.mockResolvedValue(dummyLocalNote as Note);
};

const リモートのノートがDBに存在する = () => {
  mockedPrisma.note.findUnique.mockResolvedValue(dummyRemoteNote as Note);
};

const 通信しない = () => {};

const リモートのノートが404 = () => {
  server.use(
    http.get(
      dummyRemoteNote.url,
      () => new HttpResponse(null, { status: 404 }),
    ),
  );
};

const リモートのノートの形式が不正 = () => {
  server.use(
    http.get(
      dummyRemoteNote.url,
      () => new HttpResponse(JSON.stringify({ type: "Invalid" })),
    ),
  );
};

const リモートのノート取得に成功した = () => {
  server.use(
    http.get(
      dummyRemoteNote.url,
      () => new HttpResponse(JSON.stringify(dummyRemoteNoteActivity)),
    ),
  );
};

jest.mock("@/_shared/user/services/systemUser");
jest.mocked(systemUserService).findOrCreateSystemUser.mockResolvedValue({
  id: "dummySystemUser",
  privateKey: mockedKeys.privateKey,
});

jest.mock("@/_shared/service/user");
jest.mocked(userService).findOrFetchUserByActor.mockResolvedValue({
  id: "dummyUserId",
} as User);

describe("noteFindService", () => {
  describe("findOrFetchNoteByUrl", () => {
    test.each`
      url                    | dbCondition                       | serverCondition                   | expected                                   | resultDescription
      ${dummyLocalNote.url}  | ${ノートがDBに存在しない}         | ${通信しない}                     | ${noteFindService.NotFoundError}           | ${"NotFoundErrorを返す"}
      ${dummyLocalNote.url}  | ${ローカルのノートがDBに存在する} | ${通信しない}                     | ${dummyLocalNote}                          | ${"ローカルのノートを返す"}
      ${dummyRemoteNote.url} | ${リモートのノートがDBに存在する} | ${通信しない}                     | ${dummyRemoteNote}                         | ${"リモートのノートを返す"}
      ${dummyRemoteNote.url} | ${ノートがDBに存在しない}         | ${リモートのノートが404}          | ${NotOKError}                              | ${"NotOKErrorを返す"}
      ${dummyRemoteNote.url} | ${ノートがDBに存在しない}         | ${リモートのノートの形式が不正}   | ${noteFindService.ActivityValidationError} | ${"ActivityValidationErrorを返す"}
      ${dummyRemoteNote.url} | ${ノートがDBに存在しない}         | ${リモートのノート取得に成功した} | ${dummyRemoteNote}                         | ${"リモートのノートを返す"}
    `(
      "$dbCondition.name、$serverCondition.nameとき、$resultDescription",
      async ({ url, dbCondition, serverCondition, expected }) => {
        // arrange
        dbCondition();
        serverCondition();
        mockedPrisma.note.create.mockResolvedValue(dummyRemoteNote as Note);
        // act
        const note = await noteFindService.findOrFetchNoteByUrl(url);
        // assert
        if (typeof expected === "function") {
          expect(note).toBeInstanceOf(expected);
        } else {
          expect(note).toEqual(expected);
        }
      },
    );
  });
});
