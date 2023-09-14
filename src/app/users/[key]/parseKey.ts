import { notFound, redirect } from "next/navigation";

import { env } from "@/utils/env";

type ParsedKey =
  | {
      userId: string;
    }
  | {
      preferredUsername: string;
      host: string;
    };

export const parseKeyOrRedirect = (key: string): ParsedKey => {
  const decodedKey = decodeURIComponent(key);
  if (!decodedKey.startsWith("@")) {
    return {
      userId: decodedKey,
    };
  }
  const [preferredUsername, host] = decodedKey.split("@").slice(1);
  if (!preferredUsername) {
    notFound();
  }
  if (host === env.HOST) {
    redirect(`/@${preferredUsername}`);
  }
  return {
    preferredUsername,
    host: host ?? env.HOST,
  };
};
