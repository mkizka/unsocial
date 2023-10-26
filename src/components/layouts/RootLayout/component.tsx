"use client";

import { Header } from "@/components/clients/Header";
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
      <Header />
      <main className="w-full max-w-[600px] pt-[54px]">{children}</main>
    </body>
  );
}
