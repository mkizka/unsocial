import { notFound } from "next/navigation";

import { userFindService } from "@/_shared/user/services/userFindService";

import { UserCard } from "./_components/UserCard";

type Params = {
  userKey: string;
};

export async function generateMetadata({ params }: { params: Params }) {
  const user = await userFindService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  return {
    title: `${user.name}(@${user.preferredUsername})`,
  };
}

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  return (
    <>
      <UserCard userKey={params.userKey} />
      {children}
    </>
  );
}
