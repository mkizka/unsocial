"use server";

import { revalidatePath } from "next/cache";

import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { systemUserService } from "@/_shared/user/services/systemUserService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";

export const action = async (relayServerId: string) => {
  const existingRelayServer = await prisma.relayServer.findUnique({
    where: {
      id: relayServerId,
    },
  });
  if (!existingRelayServer) {
    return;
  }
  await prisma.relayServer.delete({
    where: {
      id: relayServerId,
    },
  });
  const systemUser = await systemUserService.findOrCreateSystemUser();
  await apRelayService.relay({
    userId: systemUser.id,
    activity: activityStreams.undo(activityStreams.followPublic(systemUser.id)),
    inboxUrl: existingRelayServer.inboxUrl,
  });
  revalidatePath("/settings");
};
