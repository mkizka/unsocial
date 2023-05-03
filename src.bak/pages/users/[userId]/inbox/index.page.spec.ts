import { json } from "next-runtime";

import { findOrFetchUserByActorId } from "../../../../utils/findOrFetchUser";
import { verifyActivity } from "../../../../utils/httpSignature/verify";
import { logger } from "../../../../utils/logger";
import { createMockedContext } from "../../../__mocks__/context";
import { inbox } from "./inbox";
import { getServerSideProps } from "./index.page";

jest.mock("../../../../utils/findOrFetchUser");
const mockedFindOrFetchUserByActorId = jest.mocked(findOrFetchUserByActorId);

jest.mock("../../../../utils/httpSignature/verify");
const mockedVerifyActivity = jest.mocked(verifyActivity);

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

jest.mock("./inbox");
const mockedInbox = jest.mocked(inbox);

const dummyRemoteUser = {
  id: "dummyidremote",
  publicKey: "publicKey",
} as never;

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

describe("/users/[userId]/inbox", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Any",
      actor: "https://remote.example.com/users/foo",
    };
    const ctx = createMockedActivityContext(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(dummyRemoteUser);
    mockedVerifyActivity.mockReturnValue({ isValid: true });
    mockedInbox.mockResolvedValue(json({}, 200));
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).not.toHaveBeenCalled();
    expect(ctx.res.statusCode).toBe(200);
  });
  test("actorが無ければ400を返す", async () => {
    // arrange
    const activity = {
      type: "Any",
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
  test("actorで指定されたユーザーがDBになければ400を返す", async () => {
    // arrange
    const activity = {
      type: "Any",
      actor: "https://remote.example.com/users/foo",
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
  test("署名の検証結果が不正だったら400を返す", async () => {
    // arrange
    const activity = {
      type: "Any",
      actor: "https://remote.example.com/users/foo",
    };
    const ctx = createMockedActivityContext(activity);
    mockedFindOrFetchUserByActorId.mockResolvedValue(dummyRemoteUser);
    mockedVerifyActivity.mockReturnValue({ isValid: false, reason: "foo" });
    // act
    await getServerSideProps(ctx);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("リクエストヘッダの署名が不正でした")
    );
    expect(ctx.res.statusCode).toBe(400);
  });
});
