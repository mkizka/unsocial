import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { activityStreams } from "@/utils/activitypub";
import { findOrFetchUserByParams } from "@/utils/findOrFetchUser";

export async function GET(
  _: Request,
  { params }: { params: { userId: string } }
) {
  const user = await findOrFetchUserByParams(params);
  if (!user) {
    notFound();
  }
  return NextResponse.json(activityStreams.user(user), {
    headers: {
      "Content-Type": "application/activity+json",
    },
  });
}
