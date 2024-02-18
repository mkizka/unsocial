import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";
import { RelayServerForm } from "./RelayServerForm";

export async function RelayServer() {
  const relayServers = await prisma.relayServer.findMany({
    select: {
      inboxUrl: true,
      status: true,
    },
  });
  return <RelayServerForm onSubmit={action} relayServers={relayServers} />;
}
