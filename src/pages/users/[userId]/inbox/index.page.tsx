import { handle, json } from "next-runtime";
import { z } from "zod";
import { findOrFetchUserByActorId } from "../../../../utils/findOrFetchUser";
import { verifyActivity } from "../../../../utils/httpSignature/verify";
import { logger } from "../../../../utils/logger";
import { accept } from "./accept";
import { follow } from "./follow";
import { note } from "./note";

const Noop = () => undefined;
export default Noop;

const inbox = {
  Follow: follow,
  Accept: accept,
} as const;

const undoInbox = {
  Follow: follow,
};

const createInbox = {
  Note: note,
};

const keysOf = <T extends object>(obj: T) =>
  Object.keys(obj) as [keyof T, ...(keyof T)[]];

const anyActivitySchema = z.union([
  z
    .object({
      type: z.enum(keysOf(inbox)),
      actor: z.string().url(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal("Undo"),
      actor: z.string().url(),
      object: z
        .object({
          type: z.enum(keysOf(undoInbox)),
        })
        .passthrough(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal("Create"),
      actor: z.string().url(),
      object: z
        .object({
          type: z.enum(keysOf(createInbox)),
        })
        .passthrough(),
    })
    .passthrough(),
]);

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
    if (activity.data.type == "Undo") {
      return undoInbox[activity.data.object.type](
        activity.data.object,
        actorUser,
        { undo: true }
      );
    }
    if (activity.data.type == "Create") {
      return createInbox[activity.data.object.type](
        activity.data.object,
        actorUser
      );
    }
    return inbox[activity.data.type](activity.data, actorUser);
  },
});
