"use client";
import { useSearchModal } from "@/app/_components/SearchModal/hooks";
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
