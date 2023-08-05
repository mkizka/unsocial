import type { ComponentProps } from "react";

export function TextInput(props: ComponentProps<"input">) {
  return (
    <input
      type="text"
      className="form-input block w-full rounded border-primary-dark
      bg-primary-light shadow
      focus:border-primary-dark focus:ring focus:ring-primary-dark focus:ring-opacity-50"
      {...props}
    />
  );
}
