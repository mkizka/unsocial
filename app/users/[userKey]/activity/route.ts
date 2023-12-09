import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { userService } from "@/_shared/service/user";
import { activityStreams } from "@/_shared/utils/activitypub";

export async function GET(
  request: Request,
  { params }: { params: { userKey: string } },
) {
  const user = await userService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  if (request.headers.get("accept")?.includes("text/html")) {
    return NextResponse.redirect(
      new URL(`/@${user.preferredUsername}`, request.url),
    );
  }
  return NextResponse.json(activityStreams.user(user), {
    headers: {
      "Content-Type": "application/activity+json",
    },
  });
}
