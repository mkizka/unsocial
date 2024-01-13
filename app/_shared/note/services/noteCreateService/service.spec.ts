import type { Note, User } from "@prisma/client";
import crypto from "crypto";
import { http, HttpResponse } from "msw";

import { mockedPrisma } from "@/_mocks/prisma";
import { server } from "@/_mocks/server";
import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { systemUserService } from "@/_shared/service/systemUser";
import { userService } from "@/_shared/service/user";

import { noteCreateService } from ".";

jest.mock("@/_shared/service/user");
const mockedUserService = jest.mocked(userService);

const generateRsaPrivateKey = () => {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  }).privateKey;
};

jest.mock("@/_shared/service/systemUser");
jest.mocked(systemUserService).findOrCreateSystemUser.mockResolvedValue({
  id: "dummySystemUserId",
  privateKey: generateRsaPrivateKey(),
});

describe("createNoteFromActivityService", () => {
  test("正常系", async () => {
    const noteActivity = {
      type: "Note",
      id: "https://remote.example.com/notes/dummyNoteId",
      content: "content",
      inReplyTo: "https://myhost.example.com/notes/replyToId/activity",
      attributedTo: "https://remote.example.com/users/foo",
      published: "2023-01-01T00:00:00.000Z",
    } satisfies apSchemaService.NoteActivity;
    mockedPrisma.note.findUnique.mockResolvedValue({
      id: "dummyNoteId",
    } as Note);
    mockedUserService.findOrFetchUserByActor.mockResolvedValue({
      id: "dummyLocalUserId",
    } as User);
    const note = await noteCreateService.create(noteActivity);
    expect(note).not.toBeInstanceOf(Error);
    expect(mockedPrisma.note.create).toHaveBeenCalledWith({
      data: {
        attachments: {
          create: undefined,
        },
        content: "content",
        publishedAt: "2023-01-01T00:00:00.000Z",
        replyToId: "dummyNoteId",
        url: "https://remote.example.com/notes/dummyNoteId",
        userId: "dummyLocalUserId",
      },
    });
  });
  test("リプライ先がリモートの場合", async () => {
    const noteActivity = {
      type: "Note",
      id: "https://remote1.example.com/notes/dummyNoteId1",
      content: "remote1",
      inReplyTo: "https://remote2.example.com/notes/dummyNoteId2",
      attributedTo: "https://remote1.example.com/users/dummyUserId1",
      published: "2023-01-01T00:00:00.000Z",
    } satisfies apSchemaService.NoteActivity;
    const replyToActivity = {
      type: "Note",
      id: "https://remote2.example.com/notes/dummyNoteId2",
      content: "remote2",
      inReplyTo: null,
      attributedTo: "https://remote2.example.com/users/dummyUserId2",
      published: "2023-01-01T00:00:00.000Z",
    } satisfies apSchemaService.NoteActivity;
    server.use(
      http.get(replyToActivity.id, () => HttpResponse.json(replyToActivity)),
    );
    mockedPrisma.note.create.mockResolvedValue({
      id: "dummyNoteId",
    } as Note);
    mockedUserService.findOrFetchUserByActor.mockResolvedValue({
      id: "dummyLocalUserId",
    } as User);
    const note = await noteCreateService.create(noteActivity);
    expect(note).not.toBeInstanceOf(Error);
    expect(mockedPrisma.note.create).toHaveBeenNthCalledWith(1, {
      data: {
        attachments: {
          create: undefined,
        },
        content: "remote2",
        publishedAt: "2023-01-01T00:00:00.000Z",
        replyToId: undefined,
        url: "https://remote2.example.com/notes/dummyNoteId2",
        userId: "dummyLocalUserId",
      },
    });
    expect(mockedPrisma.note.create).toHaveBeenNthCalledWith(2, {
      data: {
        attachments: {
          create: undefined,
        },
        content: "remote1",
        publishedAt: "2023-01-01T00:00:00.000Z",
        replyToId: "dummyNoteId",
        url: "https://remote1.example.com/notes/dummyNoteId1",
        userId: "dummyLocalUserId",
      },
    });
  });
});
