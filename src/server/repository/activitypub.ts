import { fetchJson } from "@/utils/fetchJson";
import { createLogger } from "@/utils/logger";
import { safeUrl } from "@/utils/safeUrl";

const logger = createLogger("apRepository");

export const fetchActor = (actorId: URL) => {
  return fetchJson(actorId, {
    next: {
      revalidate: 0,
    },
    headers: {
      accept: "application/activity+json",
    },
  });
};

export const fetchWebFinger = (params: {
  preferredUsername: string;
  host: string;
}) => {
  const remoteUrl = safeUrl(`https://${params.host}`);
  if (!remoteUrl) {
    logger.info(`https://${params.host}がURLとして不正でした`);
    return null;
  }
  const webFingerUrl = new URL("/.well-known/webfinger", remoteUrl);
  webFingerUrl.searchParams.append(
    "resource",
    `acct:${params.preferredUsername}@${params.host}`,
  );
  return fetchJson(webFingerUrl, {
    next: {
      revalidate: 0,
    },
  });
};
