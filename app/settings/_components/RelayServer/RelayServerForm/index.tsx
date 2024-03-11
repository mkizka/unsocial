"use client";
import { useFormState } from "react-dom";

import { Button } from "@/_shared/ui/Button";
import { Input } from "@/_shared/ui/Input";
import { cn } from "@/_shared/utils/cn";
import type { FormAction } from "@/_shared/utils/formAction";

type Props = {
  formAction: FormAction;
};

export function RelayServerForm({ formAction }: Props) {
  const [state, dispatch] = useFormState(formAction, null);
  return (
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
          data-testid="relay-server-form__input"
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
          <Button className="ml-auto" data-testid="relay-server-form__submit">
            登録
          </Button>
        </div>
      </div>
    </form>
  );
}
