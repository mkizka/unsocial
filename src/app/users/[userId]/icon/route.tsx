import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { env } from "@/utils/env";
import { prisma } from "@/utils/prisma";

export async function GET(
  _: Request,
  { params }: { params: { userId: string } },
) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
  });
  if (!user) {
    notFound();
  }
  const url =
    user.icon ??
    `https://${env.HOST}/users/_/icon/edge?text=${user.preferredUsername}`;
  const image = await fetch(url);
  return new NextResponse(await image.blob(), {
    headers: {
      "Content-Type": image.headers.get("Content-Type") ?? "image/png",
      // https://vercel.com/docs/concepts/functions/edge-functions/edge-caching#recommended-cache-control
      "Cache-Control": `max-age=0, s-maxage=${60 * 60 * 3}`,
    },
  });
}
