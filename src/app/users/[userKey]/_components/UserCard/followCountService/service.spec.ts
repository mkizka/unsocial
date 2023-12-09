import { mockedPrisma } from "@/app/_mocks/prisma";

import * as followCountService from "./service";

describe("followService", () => {
  test("count", async () => {
    // arrange
    const dummyUserId = "dummyUserId";
    mockedPrisma.follow.count
      .calledWith(
        expect.objectContaining({ where: { followeeId: dummyUserId } }),
      )
      .mockResolvedValueOnce(1);
    mockedPrisma.follow.count
      .calledWith(
        expect.objectContaining({ where: { followerId: dummyUserId } }),
      )
      .mockResolvedValueOnce(2);
    // act
    const result = await followCountService.count(dummyUserId);
    // assert
    expect(result).toEqual({
      followersCount: 1,
      followeesCount: 2,
    });
  });
});
