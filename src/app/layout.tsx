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
    <html lang="ja">
      <body className="flex justify-center bg-primary text-dark">
        <div className="w-full max-w-xl">{children}</div>
      </body>
    </html>
  );
}
