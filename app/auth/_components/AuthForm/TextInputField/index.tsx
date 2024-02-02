import type { ComponentProps } from "react";

import { Input } from "@/_shared/ui/Input";

type Props = {
  name: string;
  label: string;
  required?: boolean;
  autoComplete: ComponentProps<"input">["autoComplete"];
};

export function TextInputField({ name, label, required, autoComplete }: Props) {
  return (
    <div className="space-y-2">
      <label htmlFor={name}>{label}</label>
      <Input
        id={name}
        name={name}
        data-testid={`auth-form__input-${name}`}
        required={required ?? true}
        autoComplete={autoComplete}
      />
    </div>
  );
}
