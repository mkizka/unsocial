import { cn } from "@/_shared/utils/cn";

type Props = {
  className?: string;
};

// https://zenn.dev/catnose99/articles/19a05103ab9ec7
export function Spinner({ className }: Props) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className,
      )}
    >
      <div className="aspect-square h-4/5 animate-spin rounded-full border-2 border-t-transparent"></div>
    </div>
  );
}
