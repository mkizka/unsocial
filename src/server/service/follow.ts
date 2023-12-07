import { cache } from "react";

import { followRepository } from "@/server/repository";

export const findFollowers = cache((userId: string) => {
  return followRepository.findFollowers(userId);
});

export const findFollowees = cache((userId: string) => {
  return followRepository.findFollowees(userId);
});
