import type { User } from "@prisma/client";
import type { NextRequest } from "next/server";

import { httpSignatureVerifyService } from "@/_shared/activitypub/httpSignatureVerifyService";
import { userFindService } from "@/_shared/user/services/userFindService";

import { handle as accept } from "./handlers/accept";
import { handle as create } from "./handlers/create";
import { handle as delete_ } from "./handlers/delete";
import { ActivitySchemaValidationError } from "./handlers/errors";
import { handle as follow } from "./handlers/follow";
import { handle as undo } from "./handlers/undo";
import { perform } from "./inbox";

jest.mock("./handlers/follow");
const mockedFollow = jest.mocked(follow);

jest.mock("./handlers/accept");
const mockedAccept = jest.mocked(accept);

jest.mock("./handlers/delete");
const mockedDelete = jest.mocked(delete_);

jest.mock("./handlers/undo");
const mockedUndo = jest.mocked(undo);

jest.mock("./handlers/create");
const mockedCreate = jest.mocked(create);

const dummyUser = {} as User;

jest.mock("@/_shared/user/services/userFindService");
const mockedUserService = jest.mocked(userFindService);
mockedUserService.findOrFetchUserByActor.mockResolvedValue(dummyUser);

jest.mock("@/_shared/activitypub/httpSignatureVerifyService");
const mockedVerifyActivity = jest.mocked(
  httpSignatureVerifyService.verifyRequest,
);
mockedVerifyActivity.mockResolvedValue({ isValid: true });

describe("ユーザーinbox", () => {
  test.each`
    type        | fn
    ${"Follow"} | ${mockedFollow}
    ${"Accept"} | ${mockedAccept}
    ${"Delete"} | ${mockedDelete}
    ${"Undo"}   | ${mockedUndo}
    ${"Create"} | ${mockedCreate}
  `("$typeを実装した関数が呼ばれる", async ({ type, fn }) => {
    // arrange
    const activity = {
      type,
      actor: "https://remote.example.com/u/dummy_remote",
    };
    const dummyRequest = {
      headers: new Headers(),
      clone: () => dummyRequest,
      json: () => activity,
    } as unknown as NextRequest;
    // act
    const error = await perform(dummyRequest);
    // assert
    expect(error).toBeUndefined();
    expect(fn).toBeCalledWith(activity, dummyUser);
  });
  test("未実装のtypeの場合はエラーを返す", async () => {
    // arrange
    const activity = {
      type: "NotImplemented",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    const dummyRequest = {
      headers: new Headers(),
      clone: () => dummyRequest,
      json: () => activity,
    } as unknown as NextRequest;
    // act
    const error = await perform(dummyRequest);
    // assert
    expect(error).toBeInstanceOf(ActivitySchemaValidationError);
  });
  test("typeを持たないリクエストの場合はエラーを返す", async () => {
    // arrange
    const activity = {
      invalid: "value",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    const dummyRequest = {
      headers: new Headers(),
      clone: () => dummyRequest,
      json: () => activity,
    } as unknown as NextRequest;
    // act
    const error = await perform(dummyRequest);
    // assert
    expect(error).toBeInstanceOf(ActivitySchemaValidationError);
  });
});
