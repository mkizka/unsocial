import "./globals.css";

import { M_PLUS_1_Code } from "next/font/google";

import { Body } from "./_components/Body";
import { Providers } from "./_components/Providers";
import { SearchModal } from "./_components/SearchModal";
import { UserMenu } from "./_components/UserMenu";
import { env } from "./_shared/utils/env";

const siteName = env.UNSOCIAL_SITE_NAME ?? env.UNSOCIAL_HOST;
const siteTitle = `${siteName} on Unsocial`;
const siteDescription =
  env.UNSOCIAL_SITE_DESCRIPTION ??
  `${siteName}はUnsocialによって構築されたActivityPubサーバーです。`;

export const metadata = {
  metadataBase: new URL(`https://${env.UNSOCIAL_HOST}`),
  title: {
    default: siteTitle,
    template: `%s - ${siteTitle}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: false,
    follow: false,
  },
};

const font = M_PLUS_1_Code({
  weight: "400",
  subsets: ["latin"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={font.className}>
      <Providers>
        <Body>
          <header className="fixed z-10 flex h-[54px] w-full items-center justify-between rounded-b-md bg-primary-light px-4 shadow-md">
            <SearchModal />
            <UserMenu />
          </header>
          <main className="w-full max-w-[600px] pt-[58px]">{children}</main>
        </Body>
      </Providers>
    </html>
  );
}
