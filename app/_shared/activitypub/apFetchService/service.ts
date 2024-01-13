import { systemUserService } from "@/_shared/user/services/systemUserService";
import { fetcher } from "@/_shared/utils/fetcher";
import { createLogger } from "@/_shared/utils/logger";
import { safeUrl } from "@/_shared/utils/safeUrl";

const logger = createLogger("apFetchService");

export const fetchActivity = async (actorUrl: string) => {
  const response = await fetcher(actorUrl, {
    next: {
      revalidate: 60,
    },
    headers: {
      accept: "application/activity+json",
    },
    signer: await systemUserService.findOrCreateSystemUser(),
  });
  return response instanceof Error ? response : response.json();
};

export type FetchWebFingerParams = {
  preferredUsername: string;
  host: string;
};

export const fetchWebFinger = async (user: FetchWebFingerParams) => {
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
  const response = await fetcher(webFingerUrl, {
    next: {
      revalidate: 60,
    },
  });
  return response instanceof Error ? response : response.json();
};
