import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";
import { RelayServerForm } from "./RelayServerForm";

export async function RelayServer() {
  const relayServer = await prisma.relayServer.findFirst({
    select: {
      inboxUrl: true,
    },
  });
  return <RelayServerForm onSubmit={action} relayServer={relayServer} />;
}
