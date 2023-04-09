import { json } from "next-runtime";

import { logger } from "../../../../utils/logger";
import { follow } from "./follow";
import { inbox } from "./inbox";
import { note } from "./note";

jest.mock("./follow");
const mockedFollow = jest.mocked(follow).mockResolvedValue(json({}, 200));

jest.mock("./note");
const mockedNote = jest.mocked(note).mockResolvedValue(json({}, 200));

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

const dummyRemoteUser = {} as never;

describe("ユーザーinbox", () => {
  test.each`
    type        | fn
    ${"Follow"} | ${mockedFollow}
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
  test.each`
    type        | fn
    ${"Follow"} | ${mockedFollow}
  `(
    "Undoで$typeを実装した関数がundoオプションをつけて呼ばれる",
    async ({ type, fn }) => {
      // arrange
      const activity = {
        type: "Undo",
        actor: "https://remote.example.com/u/dummy_remote",
        object: { type },
      };
      // act
      await inbox(activity, dummyRemoteUser);
      // assert
      expect(fn).toBeCalledWith(activity.object, dummyRemoteUser, {
        undo: true,
      });
    }
  );
  test.each`
    type      | fn
    ${"Note"} | ${mockedNote}
  `("Createで$typeを実装した関数が呼ばれる", async ({ type, fn }) => {
    // arrange
    const activity = {
      type: "Create",
      actor: "https://remote.example.com/u/dummy_remote",
      object: { type },
    };
    // act
    await inbox(activity, dummyRemoteUser);
    // assert
    expect(fn).toBeCalledWith(activity.object, dummyRemoteUser);
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
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("検証エラー")
    );
    expect(response.status).toBe(400);
  });
  test("未実装のtypeのUndoには400を返す", async () => {
    // arrange
    const activity = {
      type: "Undo",
      actor: "https://remote.example.com/u/dummy_remote",
      object: {
        type: "Accept",
      },
    };
    // act
    const response = await inbox(activity, dummyRemoteUser);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("検証エラー")
    );
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
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("検証エラー")
    );
    expect(response.status).toBe(400);
  });
});
