import { cache } from "react";

import { findOrFetchUserByActor as _findOrFetchUserByActor } from "./userFindRepository/byActor";
import { findOrFetchUserById } from "./userFindRepository/byId";
import { findOrFetchUserByWebFinger } from "./userFindRepository/byWebfinger";
import { parseUserKey } from "./utils";

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
