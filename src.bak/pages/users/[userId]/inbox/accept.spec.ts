import { prismaMock } from "../../../../__mocks__/db";
import { logger } from "../../../../utils/logger";
import { accept } from "./accept";

const dummyRemoteUser = {
  id: "dummy_remote",
} as never;

const dummyLocalUser = {
  id: "dummy_local",
} as never;

jest.mock("../../../../utils/logger");
const mockedLogger = jest.mocked(logger);

describe("フォロー承認", () => {
  test("正常系", async () => {
    // arrange
    const activity = {
      type: "Accept",
      actor: "https://remote.example.com/u/dummy_remote",
      object: {
        type: "Follow",
        actor: "https://myhost.example.com/users/dummy_local",
        object: "https://remote.example.com/u/dummy_remote",
      },
    };
    prismaMock.user.findFirst.mockResolvedValue(dummyLocalUser);
    // act
    const response = await accept(activity, dummyRemoteUser);
    // assert
    expect(mockedLogger.info).toHaveBeenCalledWith("完了: フォロー承認");
    expect(prismaMock.follow.update).toHaveBeenCalledWith({
      where: {
        followeeId_followerId: {
          followeeId: "dummy_remote",
          followerId: "dummy_local",
        },
      },
      data: {
        status: "ACCEPTED",
      },
    });
    expect(response.status).toBe(200);
  });
});
