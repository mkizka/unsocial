import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { userService } from "@/server/service";
import { env } from "@/utils/env";

export async function GET(
  _: Request,
  { params }: { params: { userKey: string } },
) {
  const user = await userService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  const url =
    user.icon ??
    `https://${env.HOST}/users/_/icon.edge.png?text=${user.preferredUsername}`;
  const image = await fetch(url);
  return new NextResponse(await image.arrayBuffer(), {
    headers: {
      "Content-Type": image.headers.get("Content-Type") ?? "image/png",
      // https://vercel.com/docs/concepts/functions/edge-functions/edge-caching#recommended-cache-control
      "Cache-Control": `max-age=0, s-maxage=${60 * 60 * 3}`,
    },
  });
}
