import { inbox } from ".";
import { accept } from "./accept";
import { create } from "./create";
import { delete_ } from "./delete";
import { follow } from "./follow";
import { undo } from "./undo";

jest.mock("./follow");
const mockedFollow = jest
  .mocked(follow)
  .mockResolvedValue({ status: 200, message: "メッセージ" });

jest.mock("./accept");
const mockedAccept = jest
  .mocked(accept)
  .mockResolvedValue({ status: 200, message: "メッセージ" });

jest.mock("./delete");
const mockedDelete = jest
  .mocked(delete_)
  .mockResolvedValue({ status: 200, message: "メッセージ" });

jest.mock("./undo");
const mockedUndo = jest
  .mocked(undo)
  .mockResolvedValue({ status: 200, message: "メッセージ" });

jest.mock("./create");
const mockedCreate = jest
  .mocked(create)
  .mockResolvedValue({ status: 200, message: "メッセージ" });

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
  test("未実装のtypeの場合は400を返す", async () => {
    // arrange
    const activity = {
      type: "NotImplemented",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    // act
    const response = await inbox(activity, dummyRemoteUser);
    // assert
    expect(response.status).toBe(400);
  });
  test("typeを持たないリクエストの場合は400を返す", async () => {
    // arrange
    const activity = {
      invalid: "value",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    // act
    const response = await inbox(activity, dummyRemoteUser);
    // assert
    expect(response.status).toBe(400);
  });
});
