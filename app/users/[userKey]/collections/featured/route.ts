import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { userFindService } from "@/_shared/user/services/userFindService";
import { env } from "@/_shared/utils/env";

export async function GET(
  _: Request,
  { params }: { params: { userKey: string } },
) {
  const user = await userFindService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  return NextResponse.json(
    {
      "@context": ["https://www.w3.org/ns/activitystreams"],
      id: `https://${env.UNSOCIAL_HOST}/users/${user.id}/collections/featured`,
      type: "OrderedCollection",
      totalItems: 0,
      orderedItems: [],
    },
    {
      headers: {
        "Content-Type": "application/activity+json",
        "Cache-Control": "max-age=0, s-maxage=60",
      },
    },
  );
}
