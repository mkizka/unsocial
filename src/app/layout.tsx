import "./globals.css";

import { M_PLUS_1_Code } from "next/font/google";

import { RootLayout } from "@/components/layouts/RootLayout";

import { Providers } from "./providers";

const font = M_PLUS_1_Code({
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Unsocial",
  description: "ActivityPubおためし実装",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={font.className}>
      <Providers>
        <RootLayout>{children}</RootLayout>
      </Providers>
    </html>
  );
}
