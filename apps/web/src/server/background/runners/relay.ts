import type { AP } from "activitypub-core-types";
import type { Session } from "next-auth";

import { fetcher } from "@/utils/fetcher";
import { signActivity } from "@/utils/httpSignature/sign";
import { logger } from "@/utils/logger";

export const relayActivity = async (params: {
  sender: NonNullable<Session["user"]>;
  activity: AP.Activity;
}) => {
  // TODO: 連合先の各サーバーに送信するようにする
  const inboxUrl = new URL("https://misskey.localhost/inbox");
  const signedHeaders = signActivity({ ...params, inboxUrl });
  logger.info(`Activity送信: ${JSON.stringify(params.activity)}`);
  const response = await fetcher(inboxUrl, {
    method: "POST",
    body: JSON.stringify(params.activity),
    headers: {
      Accept: "application/activity+json",
      ...signedHeaders,
    },
  });
  logger.info(`${inboxUrl}: ${response}`);
};
