"use server";
import { revalidatePath } from "next/cache";

import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { systemUserService } from "@/_shared/user/services/systemUserService";
import { activityStreams } from "@/_shared/utils/activitypub";
import type { ServerAction } from "@/_shared/utils/serverAction";

export const action: ServerAction = async (_, formData) => {
  const inboxUrl = formData.get("inbox-url");
  if (typeof inboxUrl !== "string") {
    return {
      type: "error",
      message: "入力内容が不正です",
    };
  }
  const systemUser = await systemUserService.findOrCreateSystemUser();
  await apRelayService.relay({
    userId: systemUser.id,
    activity: activityStreams.followPublic(systemUser.id),
    inboxUrl,
  });
  revalidatePath("/settings");
  return {
    type: "success",
    message: "リレーサーバーにFollowアクティビティを送信しました",
  };
};
