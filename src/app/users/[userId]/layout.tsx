import { notFound } from "next/navigation";

import { UserPageLayout } from "@/components/layouts/UserPageLayout";
import { userService } from "@/server/service";
import { env } from "@/utils/env";

type Props = {
  params: {
    userId: string;
  };
};

export async function generateMetadata({ params: { userId } }: Props) {
  const user = await userService.findOrFetchUserByParams({ userId });
  if (!user) {
    notFound();
  }
  return {
    title: `${user.name} (@${user.preferredUsername}) - ${env.HOST}`,
  };
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userId: string };
}) {
  return <UserPageLayout userId={params.userId}>{children}</UserPageLayout>;
}
