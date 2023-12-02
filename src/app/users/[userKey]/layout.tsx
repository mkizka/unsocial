import type { ReactNode } from "react";

import { UserCard } from "./_components/UserCard";

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

type Props = {
  userKey: string;
  children: ReactNode;
};

export async function UserPageLayout({ userKey, children }: Props) {
  return (
    <>
      <UserCard userKey={userKey} />
      {children}
    </>
  );
}
