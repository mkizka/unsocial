import { fetcher } from "@/utils/fetcher";
import { createLogger } from "@/utils/logger";
import { safeUrl } from "@/utils/safeUrl";

const logger = createLogger("apRepository");

export const fetchActor = (actorUrl: string) => {
  return fetcher(actorUrl, {
    next: {
      revalidate: 0,
    },
    headers: {
      accept: "application/activity+json",
    },
  });
};

export type FetchWebFingerParams = {
  preferredUsername: string;
  host: string;
};

export const fetchWebFinger = (user: FetchWebFingerParams) => {
  const remoteUrl = safeUrl(`https://${user.host}`);
  if (!remoteUrl) {
    logger.info(`https://${user.host}がURLとして不正でした`);
    return null;
  }
  const webFingerUrl = new URL("/.well-known/webfinger", remoteUrl);
  webFingerUrl.searchParams.append(
    "resource",
    `acct:${user.preferredUsername}@${user.host}`,
  );
  return fetcher(webFingerUrl, {
    next: {
      revalidate: 0,
    },
  });
};
