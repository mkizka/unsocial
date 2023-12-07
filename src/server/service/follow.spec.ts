import type { Follow } from "@prisma/client";

import { mockedPrisma } from "@/mocks/prisma";

import * as followService from "./follow";

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
    const result = await followService.findFollowers(dummyUserId);
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
    const result = await followService.findFollowees(dummyUserId);
    // assert
    expect(result).toEqual([dummyFollow.followee]);
  });
});
