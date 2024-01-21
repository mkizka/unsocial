"use client";
import { useSearchModal } from "@/_components/SearchModal/hooks";
import { cn } from "@/_shared/utils/cn";

export function Body({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSearchModal();
  return (
    <body
      className={cn(
        "text-dark flex min-h-screen justify-center bg-background antialiased",
        {
          "overflow-hidden": isOpen,
        },
      )}
    >
      {children}
    </body>
  );
}
