import { cache } from "react";

import { followRepository } from "../repository";

export const findFollowers = cache((userId: string) => {
  return followRepository.findFollowers(userId);
});

export const findFollowees = cache((userId: string) => {
  return followRepository.findFollowees(userId);
});

export const count = cache(async (userId: string) => {
  return {
    followersCount: await followRepository.countFollowers(userId),
    followeesCount: await followRepository.countFollowees(userId),
  };
});
