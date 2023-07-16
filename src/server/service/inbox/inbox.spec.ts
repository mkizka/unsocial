import { handle as accept } from "./accept";
import { handle as create } from "./create";
import { handle as delete_ } from "./delete";
import { handle as follow } from "./follow";
import { handle as inbox } from "./inbox";
import { ActivitySchemaValidationError } from "./shared";
import { handle as undo } from "./undo";

jest.mock("./follow");
const mockedFollow = jest.mocked(follow);

jest.mock("./accept");
const mockedAccept = jest.mocked(accept);

jest.mock("./delete");
const mockedDelete = jest.mocked(delete_);

jest.mock("./undo");
const mockedUndo = jest.mocked(undo);

jest.mock("./create");
const mockedCreate = jest.mocked(create);

const dummyRemoteUser = {} as never;

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
    // act
    await inbox(activity, dummyRemoteUser);
    // assert
    expect(fn).toBeCalledWith(activity, dummyRemoteUser);
  });
  test("未実装のtypeの場合はエラーを返す", async () => {
    // arrange
    const activity = {
      type: "NotImplemented",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    // act
    const error = await inbox(activity, dummyRemoteUser);
    // assert
    expect(error).toBeInstanceOf(ActivitySchemaValidationError);
  });
  test("typeを持たないリクエストの場合はエラーを返す", async () => {
    // arrange
    const activity = {
      invalid: "value",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    // act
    const error = await inbox(activity, dummyRemoteUser);
    // assert
    expect(error).toBeInstanceOf(ActivitySchemaValidationError);
  });
});
