import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { userFindService } from "@/_shared/user/services/userFindService";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity, followee) => {
  const parsedAccept = apSchemaService.acceptSchema.safeParse(activity);
  if (!parsedAccept.success) {
    return new ActivitySchemaValidationError(parsedAccept.error);
  }
  const follower = await userFindService.findOrFetchUserByActor(
    parsedAccept.data.object.actor,
  );
  if (follower instanceof Error) {
    return new BadActivityRequestError(
      "Acceptされたフォロワーが存在しませんでした",
    );
  }
  if (
    // システムユーザーに対するフォローがリレー登録によるものであれば、フォローデータを作成する
    follower.preferredUsername === env.UNSOCIAL_HOST &&
    follower.host === env.UNSOCIAL_HOST &&
    parsedAccept.data.object.object ===
      "https://www.w3.org/ns/activitystreams#Public"
  ) {
    await prisma.follow.create({
      data: {
        followerId: follower.id,
        followeeId: followee.id,
        status: "ACCEPTED",
      },
    });
  }
  await prisma.follow.update({
    where: {
      followeeId_followerId: {
        followeeId: followee.id,
        followerId: follower.id,
      },
    },
    data: {
      status: "ACCEPTED",
    },
  });
};
