"use client";
import type { Prisma, RelayServerStatus } from "@prisma/client";
import { useFormState } from "react-dom";

import { Button } from "@/_shared/ui/Button";
import { Card } from "@/_shared/ui/Card";
import { Input } from "@/_shared/ui/Input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_shared/ui/Table";
import { cn } from "@/_shared/utils/cn";
import type { ServerAction } from "@/_shared/utils/serverAction";

const STATUS_TEXT = {
  SENT: "送信済み",
  ACCEPTED: "承認済み",
  FAILED: "失敗", // TODO: 実装する
} as const satisfies {
  [key in RelayServerStatus]: string;
};

type RelayServer = Prisma.RelayServerGetPayload<{
  select: {
    inboxUrl: true;
    status: true;
  };
}>;

type Props = {
  relayServers: RelayServer[];
  onSubmit: ServerAction;
};

export function RelayServerForm({ relayServers, onSubmit }: Props) {
  const [state, dispatch] = useFormState(onSubmit, null);
  return (
    <Card>
      <form action={dispatch}>
        <div className="space-y-2">
          <label className="block font-bold" htmlFor="inbox-url">
            リレーサーバー
          </label>
          <Input
            id="inbox-url"
            name="inbox-url"
            required
            placeholder={"https://relay.example.com/inbox"}
          />
          <div className="flex items-center">
            {state && (
              <p
                className={cn({
                  "text-destructive": state.type === "error",
                  "text-primary": state.type === "success",
                })}
              >
                {state.message}
              </p>
            )}
            <Button className="ml-auto">登録</Button>
          </div>
        </div>
      </form>
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
                <Button variant="ghost" className="text-destructive">
                  削除
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
