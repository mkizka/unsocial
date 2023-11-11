import type { ComponentProps } from "react";

import { TextInput } from "@/components/features/auth/AuthForm/TextInput";

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
      <TextInput
        id={name}
        name={name}
        data-testid={`text-input-${name}`}
        required={required ?? true}
        autoComplete={autoComplete}
      />
    </div>
  );
}
