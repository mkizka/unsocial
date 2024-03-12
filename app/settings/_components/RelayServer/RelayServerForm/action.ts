"use server";
import { revalidatePath } from "next/cache";

import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { systemUserService } from "@/_shared/user/services/systemUserService";
import { activityStreams } from "@/_shared/utils/activitypub";
import type { FormAction } from "@/_shared/utils/formAction";
import { prisma } from "@/_shared/utils/prisma";

export const action: FormAction = async (_, formData) => {
  const inboxUrl = formData.get("inbox-url");
  if (typeof inboxUrl !== "string") {
    return {
      type: "error",
      message: "入力内容が不正です",
    };
  }
  const existingRelayServer = await prisma.relayServer.findFirst({
    where: {
      inboxUrl,
    },
  });
  if (existingRelayServer) {
    return {
      type: "error",
      message: "既に登録されています",
    };
  }
  await prisma.relayServer.create({
    data: {
      inboxUrl,
    },
  });
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
