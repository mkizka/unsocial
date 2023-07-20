import { type ReactNode } from "react";

import { Spinner } from "@/components/Spinner";

type Props = {
  loading: boolean;
  children: ReactNode;
};

export function SubmitButton({ loading, children }: Props) {
  return (
    <button
      className="block h-10 w-full text-center rounded px-3 py-1.5 shadow
    text-light bg-secondary hover:bg-secondary-dark"
      type="submit"
      data-testid="submit-button"
      disabled={loading}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
