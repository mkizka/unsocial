"use client";
import type { Prisma } from "@prisma/client";
import { useFormState } from "react-dom";

import { Button } from "@/_shared/ui/Button";
import { Card } from "@/_shared/ui/Card";
import { Input } from "@/_shared/ui/Input";
import { cn } from "@/_shared/utils/cn";
import type { ServerAction } from "@/_shared/utils/serverAction";

type RelayServer = Prisma.RelayServerGetPayload<{
  select: {
    inboxUrl: true;
  };
}>;

type Props = {
  relayServer: RelayServer | null;
  onSubmit: ServerAction;
};

export function RelayServerForm({ relayServer, onSubmit }: Props) {
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
            placeholder={relayServer?.inboxUrl ?? "未設定"}
            defaultValue={relayServer?.inboxUrl ?? undefined}
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
            <Button className="ml-auto">変更する</Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
