import { cn } from "@/_shared/utils/cn";

// https://zenn.dev/andynuma/articles/c7f6d6587c116d
type TextInputProps<T extends React.ElementType> = {
  as?: T;
};

type Props<T extends React.ElementType> = TextInputProps<T> &
  Omit<React.ComponentProps<T>, keyof TextInputProps<T>>;

export function TextInput<T extends "input" | "textarea" = "input">({
  className,
  as,
  ...props
}: Props<T>) {
  const TagName = as || "input";
  return (
    // @ts-expect-error
    <TagName
      className={cn(
        {
          "form-input": TagName === "input",
          "form-textarea": TagName === "textarea",
        },
        "bg-primary-light block w-full rounded",
        "focus:ring-primary-dark focus:focus:ring focus:ring-opacity-50",
        className,
      )}
      {...props}
    />
  );
}
