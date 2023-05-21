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
    <html lang="ja" className="dark">
      <body>
        <div className="w-screen h-screen flex justify-center text-dark bg-primary">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      </body>
    </html>
  );
}
