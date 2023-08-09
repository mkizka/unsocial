import "./globals.css";

export const metadata = {
  title: "Unsocial",
  description: "ActivityPubおためし実装",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body>
        <div className="flex h-screen w-screen justify-center bg-primary pt-4 text-dark">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      </body>
    </html>
  );
}
