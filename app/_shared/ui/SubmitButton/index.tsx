import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Spinner } from "@/_shared/ui/Spinner";
import { cn } from "@/_shared/utils/cn";

type Props = ComponentProps<"button"> & {
  children?: ReactNode;
};

export function SubmitButton({ children, className, ...props }: Props) {
  const status = useFormStatus();
  return (
    <button
      className={cn(
        "relative flex items-center justify-center",
        "rounded bg-secondary px-3 py-1.5 shadow",
        "hover:bg-secondary-dark disabled:bg-secondary-dark",
        className,
      )}
      type="submit"
      data-testid="submit-button"
      disabled={status.pending}
      {...props}
    >
      {status.pending && <Spinner className="absolute h-4/5" />}
      <span
        className={cn({
          "opacity-0": status.pending,
        })}
      >
        {children}
      </span>
    </button>
  );
}
