import { cache } from "react";

import { followRepository } from "../repository";

export const count = cache(async (userId: string) => {
  return {
    followersCount: await followRepository.countFollowers(userId),
    followeesCount: await followRepository.countFollowees(userId),
  };
});
