import "./globals.css";

import { M_PLUS_1_Code } from "next/font/google";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={font.className}>
      <body className="flex justify-center bg-primary text-dark">
        <div className="w-full max-w-[600px]">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
