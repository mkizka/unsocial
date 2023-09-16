import type { ReactNode } from "react";

import { UserCard } from "@/components/features/user/UserCard";

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
