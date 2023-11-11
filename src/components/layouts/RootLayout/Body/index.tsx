"use client";
import { useSearchModal } from "@/components/ui/SearchModal/hooks";
import { cn } from "@/utils/cn";

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
