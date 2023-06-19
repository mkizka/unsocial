import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "@/utils/env";
import { prisma } from "@/utils/prisma";

export async function GET(request: NextRequest) {
  const preferredUsername =
    request.nextUrl.searchParams.get("preferredUsername");
  const host = request.nextUrl.searchParams.get("host");
  if (!preferredUsername || !host) {
    notFound();
  }
  const user = await prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername,
        host,
      },
    },
  });
  if (!user) {
    notFound();
  }
  const url =
    user.icon ??
    `https://${env.HOST}/icon/edge?preferredUsername=${preferredUsername}`;
  const image = await fetch(url);
  return new NextResponse(await image.blob(), {
    headers: {
      "Content-Type": image.headers.get("Content-Type") ?? "image/png",
      // https://vercel.com/docs/concepts/functions/edge-functions/edge-caching#recommended-cache-control
      "Cache-Control": `max-age=0, s-maxage=${60 * 60 * 3}`,
    },
  });
}
