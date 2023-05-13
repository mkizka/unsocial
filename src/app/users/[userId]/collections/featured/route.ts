import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { env } from "@/utils/env";
import { findOrFetchUserByParams } from "@/utils/findOrFetchUser";

export async function GET(
  _: Request,
  { params }: { params: { userId: string } }
) {
  const user = await findOrFetchUserByParams(params);
  if (!user) {
    notFound();
  }
  // TODO: activityStreams.orderedCollection実装
  return NextResponse.json({
    "@context": ["https://www.w3.org/ns/activitystreams"],
    id: `https://${env.HOST}/users/${user.id}/collections/featured`,
    type: "OrderedCollection",
    totalItems: 0,
    orderedItems: [],
  });
}
