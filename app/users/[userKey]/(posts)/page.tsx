import { notFound, redirect } from "next/navigation";

import { userFindService } from "@/_shared/user/services/userFindService";
import { shouldReturnActivityStreams } from "@/_shared/utils/activitypub";
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
  if (shouldReturnActivityStreams()) {
    redirect(`https://${env.UNSOCIAL_HOST}/users/${user.id}/activity`);
  }
  return <UserPage user={user} currentTab="root" />;
}
