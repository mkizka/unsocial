import type { ReactNode } from "react";

import { UserCard } from "@/components/features/user/UserCard";

type Props = {
  userId: string;
  children: ReactNode;
};

export async function UserPageLayout({ userId, children }: Props) {
  return (
    <>
      <UserCard userId={userId} />
      {children}
    </>
  );
}
