import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { userService } from "@/server/service";
import { activityStreams } from "@/utils/activitypub";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const user = await userService.findOrFetchUserByParams(params);
  if (!user) {
    notFound();
  }
  if (request.headers.get("accept")?.includes("text/html")) {
    return NextResponse.redirect(
      new URL(`/@${user.preferredUsername}`, request.url)
    );
  }
  return NextResponse.json(activityStreams.user(user), {
    headers: {
      "Content-Type": "application/activity+json",
    },
  });
}
