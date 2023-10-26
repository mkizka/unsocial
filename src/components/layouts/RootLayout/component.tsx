"use client";

import { useSearchModal } from "@/components/clients/SearchModal/hooks";
import { cn } from "@/utils/cn";

export function RootLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSearchModal();
  return (
    <body
      className={cn("flex justify-center bg-primary text-dark", {
        "overflow-hidden": isOpen,
      })}
    >
      <div className="w-full max-w-[600px]">{children}</div>
    </body>
  );
}
