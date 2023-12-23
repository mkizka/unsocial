import { UserCard } from "./_components/UserCard";

// TODO: https://github.com/vercel/next.js/issues/52126 が解決されたら追加

// export async function generateMetadata({ params: { userId } }: Props) {
//   const user = await userService.findOrFetchUserByParams({ userId });
//   if (!user) {
//     notFound();
//   }
//   return {
//     title: `${user.name} (@${user.preferredUsername}) - ${env.UNSOCIAL_HOST}`,
//   };
// }

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userKey: string };
}) {
  return (
    <>
      <UserCard userKey={params.userKey} />
      {children}
    </>
  );
}
