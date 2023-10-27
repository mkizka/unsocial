import { Header } from "@/components/clients/Header";

import { Body } from "./Body";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Body>
      <Header />
      <main className="w-full max-w-[600px] pt-[58px]">{children}</main>
    </Body>
  );
}
