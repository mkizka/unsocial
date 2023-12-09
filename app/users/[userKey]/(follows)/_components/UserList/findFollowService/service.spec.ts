import type { Follow } from "@prisma/client";

import { mockedPrisma } from "@/_mocks/prisma";

import * as followFindService from "./service";

describe("followService", () => {
  test("findFollowers", async () => {
    // arrange
    const dummyUserId = "dummyUserId";
    const dummyFollow = {
      id: "dummyId",
      follower: { id: "dummyFollowerId" },
    };
    mockedPrisma.follow.findMany
      .calledWith(
        expect.objectContaining({ where: { followeeId: dummyUserId } }),
      )
      .mockResolvedValueOnce([dummyFollow] as unknown as Follow[]);
    // act
    const result = await followFindService.followers(dummyUserId);
    // assert
    expect(result).toEqual([dummyFollow.follower]);
  });
  test("findFollowees", async () => {
    // arrange
    const dummyUserId = "dummyUserId";
    const dummyFollow = {
      id: "dummyId",
      followee: { id: "dummyFolloweeId" },
    };
    mockedPrisma.follow.findMany
      .calledWith(
        expect.objectContaining({ where: { followerId: dummyUserId } }),
      )
      .mockResolvedValueOnce([dummyFollow] as unknown as Follow[]);
    // act
    const result = await followFindService.followees(dummyUserId);
    // assert
    expect(result).toEqual([dummyFollow.followee]);
  });
});
