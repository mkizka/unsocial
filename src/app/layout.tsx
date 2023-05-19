import "./globals.css";

export const metadata = {
  title: "Soshal",
  description: "ActivityPubおためし実装",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="w-screen h-screen flex justify-center bg-gray-100">
          <div className="max-w-xl">{children}</div>
        </div>
      </body>
    </html>
  );
}
