import "./globals.css";

import { Providers } from "./providers";

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
    <html lang="ja">
      <body className="flex justify-center bg-primary text-dark">
        <div className="w-full max-w-[600px]">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
