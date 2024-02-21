import { Card } from "@/_shared/ui/Card";
import { prisma } from "@/_shared/utils/prisma";

import { RelayServerForm } from "./RelayServerForm";
import { action as formAction } from "./RelayServerForm/action";
import { RelayServerTable } from "./RelayServerTable";
import { action as deleteAction } from "./RelayServerTable/action";

export async function RelayServer() {
  const relayServers = await prisma.relayServer.findMany();
  return (
    <Card>
      <RelayServerForm formAction={formAction} />
      <RelayServerTable
        deleteAction={deleteAction}
        relayServers={relayServers}
      />
    </Card>
  );
}
