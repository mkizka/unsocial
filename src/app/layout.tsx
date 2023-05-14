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
      <body>{children}</body>
    </html>
  );
}
