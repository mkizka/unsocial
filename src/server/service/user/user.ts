import { cache } from "react";

import {
  findOrFetchUserById,
  findOrFetchUserByWebFinger,
} from "./findOrFetchUser";
import { findOrFetchUserByActor as _findOrFetchUserByActor } from "./findOrFetchUser";
import { parseUserKey } from "./parseUserKey";

export const findOrFetchUserByActor = cache(_findOrFetchUserByActor);

export const findOrFetchUserByKey = cache(async (userKey: string) => {
  const parsed = parseUserKey(userKey);
  if ("id" in parsed) {
    return findOrFetchUserById(parsed.id);
  }
  if ("preferredUsername" in parsed) {
    return findOrFetchUserByWebFinger(parsed);
  }
  return parsed;
});
