import "./globals.css";

import { M_PLUS_1_Code } from "next/font/google";

import { Body } from "./_components/Body";
import { Providers } from "./_components/Providers";
import { SearchModal } from "./_components/SearchModal";
import { UserMenu } from "./_components/UserMenu";
import { env } from "./_shared/utils/env";

const font = M_PLUS_1_Code({
  weight: "400",
  subsets: ["latin"],
});

const siteName = "Unsocial";
const description = "ActivityPubおためし実装";
const url = `https://${env.UNSOCIAL_HOST}`;

export const metadata = {
  metadataBase: new URL(url),
  title: {
    default: siteName,
    /** `next-seo`の`titleTemplate`に相当する機能 */
    template: `%s - ${siteName}`,
  },
  description,
  openGraph: {
    title: siteName,
    description,
    url,
    siteName,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteName,
    description,
    site: "@mkizka",
  },
  robots: {
    index: false,
    follow: false,
  },
};

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
