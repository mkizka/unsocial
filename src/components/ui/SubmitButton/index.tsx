import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";

type Props = ComponentProps<"button"> & {
  children?: ReactNode;
};

export function SubmitButton({ children, className, ...props }: Props) {
  const status = useFormStatus();
  return (
    <button
      className={cn(
        "block rounded bg-secondary px-3 py-1.5 text-center text-light shadow hover:bg-secondary-dark disabled:bg-secondary-dark",
        className,
      )}
      type="submit"
      data-testid="submit-button"
      disabled={status.pending}
      {...props}
    >
      {status.pending ? <Spinner /> : children}
    </button>
  );
}
