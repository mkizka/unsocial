"use client";
import type { User } from "@prisma/client";
import { useFormState } from "react-dom";

import { Card } from "@/_shared/ui/Card";
import { Input } from "@/_shared/ui/Input";
import { SubmitButton } from "@/_shared/ui/SubmitButton";
import { Textarea } from "@/_shared/ui/Textarea";
import { cn } from "@/_shared/utils/cn";
import type { ServerAction } from "@/_shared/utils/serverAction";

type Props = {
  user: Pick<User, "name" | "summary">;
  onSubmit: ServerAction;
};

export function ProfileForm({ user, onSubmit }: Props) {
  const [state, dispatch] = useFormState(onSubmit, null);
  return (
    <Card>
      <form action={dispatch}>
        <div className="space-y-2">
          <label className="block font-bold" htmlFor="name">
            表示名
          </label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={user.name ?? ""}
            autoComplete="name"
          />
          <label className="block font-bold" htmlFor="summary">
            自己紹介
          </label>
          <Textarea
            id="summary"
            name="summary"
            defaultValue={user.summary ?? ""}
          />
          <div className="flex items-center">
            {state && (
              <p
                className={cn({
                  "text-accent": state.type === "error",
                  "text-secondary": state.type === "success",
                })}
              >
                {state.message}
              </p>
            )}
            <SubmitButton className="ml-auto">変更する</SubmitButton>
          </div>
        </div>
      </form>
    </Card>
  );
}
