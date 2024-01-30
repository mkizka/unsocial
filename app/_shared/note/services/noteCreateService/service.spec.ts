import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { LocalNoteFactory, RemoteNoteFactory } from "@/_shared/factories/note";
import { RemoteUserFactory } from "@/_shared/factories/user";
import { noteFindService } from "@/_shared/note/services/noteFindService";
import { userFindService } from "@/_shared/user/services/userFindService";

import { noteCreateService } from ".";

jest.mock("@/_shared/note/services/noteFindService");
const mockedNoteFindService = jest.mocked(noteFindService);

jest.mock("@/_shared/user/services/userFindService");
const mockedUserService = jest.mocked(userFindService);

jest.useFakeTimers();
const mockedNow = new Date("2021-01-02T00:00:00.000Z");
jest.setSystemTime(mockedNow);

describe("createNoteFromActivityService", () => {
  test("リプライ先がローカルの場合", async () => {
    // arrange
    const replyTo = await LocalNoteFactory.create();
    mockedNoteFindService.findOrFetchNoteByUrl.mockResolvedValue(replyTo);
    const noteUser = await RemoteUserFactory.create();
    mockedUserService.findOrFetchUserByActor.mockResolvedValue(noteUser);
    const noteActivity = {
      type: "Note",
      id: "https://remote.example.com/notes/dummyNoteId",
      content: "content",
      inReplyTo: `https://myhost.example.com/notes/${replyTo.id}/activity`,
      attributedTo: noteUser.actorUrl!,
      published: "2023-01-01T00:00:00.000Z",
    } satisfies apSchemaService.NoteActivity;
    // act
    const note = await noteCreateService.create(noteActivity);
    // assert
    expect(note).toEqualPrisma({
      id: expect.any(String),
      content: noteActivity.content,
      publishedAt: new Date(noteActivity.published),
      replyToId: replyTo.id,
      quoteId: null,
      url: noteActivity.id,
      userId: noteUser.id,
      createdAt: expect.anyDate(),
    });
  });
  test("リプライ先がリモートの場合", async () => {
    // arrange
    const replyTo = await RemoteNoteFactory.create();
    mockedNoteFindService.findOrFetchNoteByUrl.mockResolvedValue(replyTo);
    const noteUser = await RemoteUserFactory.create();
    mockedUserService.findOrFetchUserByActor.mockResolvedValue(noteUser);
    const noteActivity = {
      type: "Note",
      id: "https://remote.example.com/notes/dummyNoteId",
      content: "content",
      inReplyTo: replyTo.url,
      attributedTo: noteUser.actorUrl!,
      published: "2023-01-01T00:00:00.000Z",
    } satisfies apSchemaService.NoteActivity;
    // act
    const note = await noteCreateService.create(noteActivity);
    // assert
    console.log(note);
    expect(note).toEqualPrisma({
      id: expect.any(String),
      content: noteActivity.content,
      publishedAt: new Date(noteActivity.published),
      replyToId: replyTo.id,
      quoteId: null,
      url: noteActivity.id,
      userId: noteUser.id,
      createdAt: expect.anyDate(),
    });
  });
});
