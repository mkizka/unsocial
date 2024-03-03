import "./globals.css";

import { Noto_Sans_JP } from "next/font/google";

import { Body } from "./_components/Body";
import { Providers } from "./_components/Providers";
import { SearchModal } from "./_components/SearchModal";
import { UserMenu } from "./_components/UserMenu";
import { env } from "./_shared/utils/env";
import { serverInfo } from "./_shared/utils/serverInfo";

export const metadata = {
  metadataBase: new URL(`https://${env.UNSOCIAL_HOST}`),
  title: {
    default: serverInfo.title,
    template: `%s - ${serverInfo.title}`,
  },
  description: serverInfo.description,
  openGraph: {
    title: serverInfo.title,
    description: serverInfo.description,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: serverInfo.title,
    description: serverInfo.description,
  },
  robots: {
    index: false,
    follow: false,
  },
};

const font = Noto_Sans_JP({
  preload: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={font.className}>
      <Providers>
        <Body className="flex min-h-screen justify-center bg-background antialiased">
          <header className="fixed z-10 flex h-[54px] w-full items-center justify-between rounded-b-md bg-card px-4 shadow-md">
            <SearchModal />
            <UserMenu />
          </header>
          <main className="w-full max-w-[600px] pt-[58px]">{children}</main>
        </Body>
      </Providers>
    </html>
  );
}
