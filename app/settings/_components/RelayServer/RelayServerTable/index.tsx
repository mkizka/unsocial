"use client";
import type { RelayServer, RelayServerStatus } from "@prisma/client";

import { Button } from "@/_shared/ui/Button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_shared/ui/Table";

const STATUS_TEXT = {
  SENT: "送信済み",
  ACCEPTED: "承認済み",
  FAILED: "失敗", // TODO: 実装する
} as const satisfies {
  [key in RelayServerStatus]: string;
};

type Props = {
  relayServers: RelayServer[];
  deleteAction: (relayServerId: string) => Promise<void>;
};

export function RelayServerTable({ relayServers, deleteAction }: Props) {
  return (
    <Table>
      {relayServers.length === 0 && <TableCaption>登録なし</TableCaption>}
      <TableHeader>
        <TableRow>
          <TableHead>リレーサーバーのinbox</TableHead>
          <TableHead>承認状態</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {relayServers.map((relayServer) => (
          <TableRow key={relayServer.inboxUrl}>
            <TableCell>{relayServer.inboxUrl}</TableCell>
            <TableCell>{STATUS_TEXT[relayServer.status]}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={async () => await deleteAction(relayServer.id)}
              >
                削除
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
