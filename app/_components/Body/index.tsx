"use client";
import { useSearchModal } from "@/_components/SearchModal/hooks";
import { cn } from "@/_shared/utils/cn";

export function Body({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSearchModal();
  return (
    <body
      className={cn("flex justify-center bg-primary text-dark", {
        "overflow-hidden": isOpen,
      })}
    >
      {children}
    </body>
  );
}
