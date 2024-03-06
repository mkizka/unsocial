import { cache } from "react";

import { env } from "@/_shared/utils/env";

import { findOrFetchUserById } from "./userId";
import { findOrFetchUserByWebFinger } from "./webfinger";

type ParsedKey =
  | {
      id: string;
    }
  | {
      preferredUsername: string;
      host: string;
    };

const parseUserKey = (key: string): ParsedKey => {
  const decodedKey = decodeURIComponent(key);
  if (!decodedKey.startsWith("@")) {
    return {
      id: decodedKey,
    };
  }
  const [preferredUsername, host] = decodedKey.split("@").slice(1);
  return {
    // startsWith("@")でチェックしているのでundefinedにはならない
    preferredUsername: preferredUsername as string,
    host: host ?? env.UNSOCIAL_HOST,
  };
};

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
