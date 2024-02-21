"use server";

import { revalidatePath } from "next/cache";

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
  revalidatePath("/settings");
};
