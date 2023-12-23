import { env } from "@/_shared/utils/env";

import type { UserServiceError } from "./errors";

type ParsedKey =
  | {
      id: string;
    }
  | {
      preferredUsername: string;
      host: string;
    };

export const parseUserKey = (key: string): ParsedKey | UserServiceError => {
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
