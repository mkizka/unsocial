import { notFound } from "next/navigation";

import { userFindService } from "@/_shared/user/services/userFindService";
import { UserPage } from "@/users/[userKey]/(posts)/_components/UserPage";

export default async function Page({
  params,
}: {
  params: { userKey: string };
}) {
  const user = await userFindService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  return <UserPage user={user} currentTab="likes" />;
}
