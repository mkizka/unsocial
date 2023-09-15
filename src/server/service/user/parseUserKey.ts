import { env } from "@/utils/env";

import type { UserServiceError } from "./errors";
import { RedirectError, UserNotFoundError } from "./errors";

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
  if (!preferredUsername) {
    return new UserNotFoundError();
  }
  if (host === env.HOST) {
    return new RedirectError(`/@${preferredUsername}`);
  }
  return {
    preferredUsername,
    host: host ?? env.HOST,
  };
};
