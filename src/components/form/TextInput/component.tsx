import type { ComponentProps } from "react";

export function TextInput(props: ComponentProps<"input">) {
  return (
    <input
      type="text"
      className="block w-full rounded shadow
      bg-primary-light border-primary-dark
      focus:border-primary-dark focus:ring focus:ring-primary-dark focus:ring-opacity-50"
      {...props}
    />
  );
}
