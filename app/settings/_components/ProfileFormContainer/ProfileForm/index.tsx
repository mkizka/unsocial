"use client";
import type { User } from "@prisma/client";
import { useFormState } from "react-dom";

import { Button } from "@/_shared/ui/Button";
import { Card } from "@/_shared/ui/Card";
import { Input } from "@/_shared/ui/Input";
import { Textarea } from "@/_shared/ui/Textarea";
import { cn } from "@/_shared/utils/cn";
import type { FormAction } from "@/_shared/utils/formAction";

type Props = {
  user: Pick<User, "name" | "summary">;
  onSubmit: FormAction;
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
