import { systemUserService } from "@/server/service/systemUser";
import { fetcher } from "@/utils/fetcher";
import { createLogger } from "@/utils/logger";
import { safeUrl } from "@/utils/safeUrl";

const logger = createLogger("apRepository");

export const fetchActor = async (actorUrl: string) => {
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

export const fetchNote = async (noteUrl: string) => {
  const response = await fetcher(noteUrl, {
    next: {
      revalidate: 60,
    },
    headers: {
      accept: "application/activity+json",
    },
  });
  return response instanceof Error ? response : response.json();
};
