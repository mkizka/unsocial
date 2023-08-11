import type { ComponentProps, ReactNode } from "react";

import { Spinner } from "@/components/Spinner";

type Props = ComponentProps<"button"> & {
  loading: boolean;
  children?: ReactNode;
};

export function SubmitButton({ loading, children, ...props }: Props) {
  return (
    <button
      className="block h-10 w-full rounded bg-secondary px-3 py-1.5 text-center
    text-light shadow hover:bg-secondary-dark"
      type="submit"
      data-testid="submit-button"
      disabled={loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
