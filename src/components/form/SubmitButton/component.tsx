import type { ReactNode } from "react";

import { Button } from "@/components/Button";

type Props = {
  children: ReactNode;
};

export function SubmitButton({ children }: Props) {
  return (
    <Button type="submit" data-testid="submit-button">
      {children}
    </Button>
  );
}
