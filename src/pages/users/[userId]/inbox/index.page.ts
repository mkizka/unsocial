import { handle, json } from "next-runtime";
import { z } from "zod";

import { findOrFetchUserByActorId } from "../../../../utils/findOrFetchUser";
import { verifyActivity } from "../../../../utils/httpSignature/verify";
import { logger } from "../../../../utils/logger";
import { inbox } from "./inbox";

const Noop = () => undefined;
export default Noop;

const anyActivitySchema = z
  .object({
    actor: z.string().url(),
  })
  .passthrough();

export const getServerSideProps = handle({
  async post({ req, resolvedUrl }) {
    const activity = anyActivitySchema.safeParse(req.body);
    if (!activity.success) {
      logger.info(`検証エラー: ${JSON.stringify(req.body)}`);
      return json({}, 400);
    }
    const actorUser = await findOrFetchUserByActorId(
      new URL(activity.data.actor)
    );
    if (!actorUser) {
      logger.info("actorで指定されたユーザーが見つかりませんでした");
      return json({}, 400);
    }
    // TODO: Userの公開鍵を必須にする
    const result = verifyActivity(
      resolvedUrl,
      req.headers,
      actorUser.publicKey!
    );
    if (!result.isValid) {
      logger.info("リクエストヘッダの署名が不正でした: " + result.reason);
      return json({}, 400);
    }
    return inbox(activity.data, actorUser);
  },
});
