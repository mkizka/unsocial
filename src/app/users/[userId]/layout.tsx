import { UserPageLayout } from "@/components/layouts/UserPageLayout";

// TODO: https://github.com/vercel/next.js/issues/52126 が解決されたら追加

// export async function generateMetadata({ params: { userId } }: Props) {
//   const user = await userService.findOrFetchUserByParams({ userId });
//   if (!user) {
//     notFound();
//   }
//   return {
//     title: `${user.name} (@${user.preferredUsername}) - ${env.HOST}`,
//   };
// }

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userId: string };
}) {
  return <UserPageLayout userId={params.userId}>{children}</UserPageLayout>;
}
