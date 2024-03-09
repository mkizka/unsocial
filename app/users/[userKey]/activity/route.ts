import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { userFindService } from "@/_shared/user/services/userFindService";
import { activityStreams } from "@/_shared/utils/activitypub";

export async function GET(
  request: Request,
  { params }: { params: { userKey: string } },
) {
  const user = await userFindService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  return NextResponse.json(activityStreams.user(user), {
    headers: {
      "Content-Type": "application/activity+json",
      "Cache-Control": "s-maxage=60",
    },
  });
}
