import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { userFindService } from "@/_shared/user/services/userFindService";
import { env } from "@/_shared/utils/env";

import { UserPage } from "./_components/UserPage";

export default async function Page({
  params,
}: {
  params: { userKey: string };
}) {
  const user = await userFindService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  if (headers().get("accept") === "application/activity+json") {
    redirect(`https://${env.UNSOCIAL_HOST}/users/${user.id}/activity`);
  }
  return <UserPage user={user} currentTab="root" />;
}
