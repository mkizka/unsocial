"use client";

import { Provider } from "jotai";

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
