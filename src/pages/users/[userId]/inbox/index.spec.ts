import type { User } from "@prisma/client";
import { json } from "next-runtime";
import { findOrFetchUserByActorId } from "../../../../utils/findOrFetchUser";
import { verifyActivity } from "../../../../utils/httpSignature/verify";
import { createMockedContext } from "../../../__mocks__/context";
import { follow } from "./follow";
import { getServerSideProps } from "./index.page";
import { logger } from "../../../../utils/logger";
import { note } from "./note";

jest.mock("./follow");
const mockedFollow = jest.mocked(follow).mockResolvedValue(json({}, 200));

jest.mock("./note");
const mockedNote = jest.mocked(note).mockResolvedValue(json({}, 200));

jest.mock("../../../../utils/findOrFetchUser");
const mockedFindOrFetchUserByActorId = jest.mocked(findOrFetchUserByActorId);

jest.mock("../../../../utils/httpSignature/verify");
const mockedVerifyActivity = jest.mocked(verifyActivity);

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

const dummyRemoteUser: User = {
  id: "dummyidremote",
  name: "dummyRemote",
  preferredUsername: "dummy_remote",
  host: "remote.example.com",
  email: null,
  emailVerified: null,
  image: null,
  icon: null,
  publicKey: null,
  privateKey: null,
  actorUrl: null,
  inboxUrl: null,
};

const createMockedActivityContext = (activity: unknown) =>
  createMockedContext(
    {
      method: "POST",
      headers: {
        accept: "application/activity+json",
      },
      body: activity,
    },
    "/users/foo/inbox"
  );

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
    const ctx = createMockedActivityContext(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(dummyRemoteUser);
    mockedVerifyActivity.mockReturnValue({ isValid: true });
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedVerifyActivity).toHaveBeenCalledWith(
      ctx.resolvedUrl,
      ctx.req.headers,
      dummyRemoteUser.publicKey
    );
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
      const ctx = createMockedActivityContext(activity);
      mockedFindOrFetchUserByActorId.mockResolvedValue(dummyRemoteUser);
      mockedVerifyActivity.mockReturnValue({ isValid: true });
      // act
      await getServerSideProps(ctx);
      // assert
      expect(mockedVerifyActivity).toHaveBeenCalledWith(
        ctx.resolvedUrl,
        ctx.req.headers,
        dummyRemoteUser.publicKey
      );
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
    const ctx = createMockedActivityContext(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(dummyRemoteUser);
    mockedVerifyActivity.mockReturnValue({ isValid: true });
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedVerifyActivity).toHaveBeenCalledWith(
      ctx.resolvedUrl,
      ctx.req.headers,
      dummyRemoteUser.publicKey
    );
    expect(fn).toBeCalledWith(activity.object, dummyRemoteUser);
  });
  test("actorのユーザーが取得できなかった場合は400を返す", async () => {
    // arrange
    const activity = {
      type: "Follow",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    const ctx = createMockedActivityContext(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(null);
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      "actorで指定されたユーザーが見つかりませんでした"
    );
    expect(ctx.res.statusCode).toBe(400);
  });
  test("ヘッダーの署名による検証が不正だった場合は400を返す", async () => {
    // arrange
    const activity = {
      type: "Follow",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    const ctx = createMockedActivityContext(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(dummyRemoteUser);
    mockedVerifyActivity.mockReturnValue({ isValid: false, reason: "test" });
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedVerifyActivity).toHaveBeenCalledWith(
      ctx.resolvedUrl,
      ctx.req.headers,
      dummyRemoteUser.publicKey
    );
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("リクエストヘッダの署名が不正でした")
    );
    expect(ctx.res.statusCode).toBe(400);
  });
  test("未実装のtypeの場合は400を返す", async () => {
    // arrange
    const activity = {
      type: "NotImplemented",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    const ctx = createMockedActivityContext(activity);
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("検証エラー")
    );
    expect(ctx.res.statusCode).toBe(400);
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
    const ctx = createMockedActivityContext(activity);
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("検証エラー")
    );
    expect(ctx.res.statusCode).toBe(400);
  });
  test("typeを持たないリクエストの場合は400を返す", async () => {
    // arrange
    const activity = {
      invalid: "value",
      actor: "https://remote.example.com/u/dummy_remote",
    };
    const ctx = createMockedActivityContext(activity);
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("検証エラー")
    );
    expect(ctx.res.statusCode).toBe(400);
  });
});
