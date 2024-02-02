import { cn } from "@/_shared/utils/cn";

// https://zenn.dev/andynuma/articles/c7f6d6587c116d
type CardProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
};

type Props<T extends React.ElementType> = CardProps<T> &
  Omit<React.ComponentProps<T>, keyof CardProps<T>>;

export function Card<T extends React.ElementType = "div">({
  children,
  className,
  as,
  ...props
}: Props<T>) {
  const TagName = as || "div";
  return (
    <TagName
      className={cn(
        "rounded-lg border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </TagName>
  );
}
