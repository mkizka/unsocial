import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { LocalNoteFactory } from "@/_shared/factories/note";
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
      content: "content",
      publishedAt: new Date(noteActivity.published),
      replyToId: replyTo.id,
      quoteId: null,
      url: "https://remote.example.com/notes/dummyNoteId",
      userId: noteUser.id,
      createdAt: expect.any(Date),
    });
  });
  // test("リプライ先がリモートの場合", async () => {
  //   const noteActivity = {
  //     type: "Note",
  //     id: "https://remote1.example.com/notes/dummyNoteId1",
  //     content: "remote1",
  //     inReplyTo: "https://remote2.example.com/notes/dummyNoteId2",
  //     attributedTo: "https://remote1.example.com/users/dummyUserId1",
  //     published: "2023-01-01T00:00:00.000Z",
  //   } satisfies apSchemaService.NoteActivity;
  //   const replyToActivity = {
  //     type: "Note",
  //     id: "https://remote2.example.com/notes/dummyNoteId2",
  //     content: "remote2",
  //     inReplyTo: null,
  //     attributedTo: "https://remote2.example.com/users/dummyUserId2",
  //     published: "2023-01-01T00:00:00.000Z",
  //   } satisfies apSchemaService.NoteActivity;
  //   server.use(
  //     http.get(replyToActivity.id, () => HttpResponse.json(replyToActivity)),
  //   );
  //   mockedPrisma.note.create.mockResolvedValue({
  //     id: "dummyNoteId",
  //   } as Note);
  //   mockedUserService.findOrFetchUserByActor.mockResolvedValue({
  //     id: "dummyLocalUserId",
  //   } as User);
  //   const note = await noteCreateService.create(noteActivity);
  //   expect(note).not.toBeInstanceOf(Error);
  //   expect(mockedPrisma.note.create).toHaveBeenNthCalledWith(1, {
  //     data: {
  //       attachments: {
  //         create: undefined,
  //       },
  //       content: "remote2",
  //       publishedAt: "2023-01-01T00:00:00.000Z",
  //       replyToId: undefined,
  //       url: "https://remote2.example.com/notes/dummyNoteId2",
  //       userId: "dummyLocalUserId",
  //     },
  //   });
  //   expect(mockedPrisma.note.create).toHaveBeenNthCalledWith(2, {
  //     data: {
  //       attachments: {
  //         create: undefined,
  //       },
  //       content: "remote1",
  //       publishedAt: "2023-01-01T00:00:00.000Z",
  //       replyToId: "dummyNoteId",
  //       url: "https://remote1.example.com/notes/dummyNoteId1",
  //       userId: "dummyLocalUserId",
  //     },
  //   });
  // });
});
