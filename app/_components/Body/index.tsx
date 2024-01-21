"use client";
import { useSearchModal } from "@/_components/SearchModal/hooks";
import { cn } from "@/_shared/utils/cn";

export function Body({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { isOpen } = useSearchModal();
  return (
    <body
      className={cn(className, {
        "overflow-hidden": isOpen,
      })}
    >
      {children}
    </body>
  );
}
