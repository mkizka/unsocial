import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { userFindService } from "@/_shared/user/services/userFindService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { env } from "@/_shared/utils/env";

export async function GET(
  request: Request,
  { params }: { params: { userKey: string } },
) {
  const user = await userFindService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  if (request.headers.get("accept")?.includes("text/html")) {
    return NextResponse.redirect(
      `https://${env.UNSOCIAL_HOST}/@${user.preferredUsername}`,
    );
  }
  return NextResponse.json(activityStreams.user(user), {
    headers: {
      "Content-Type": "application/activity+json",
    },
  });
}
