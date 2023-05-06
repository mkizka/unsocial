import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@/server/prisma";
import { env } from "@/utils/env";

export async function GET({ nextUrl }: NextRequest) {
  const resource = nextUrl.searchParams.get("resource");
  if (
    !(
      typeof resource == "string" &&
      resource.startsWith("acct:") &&
      resource.endsWith(`@${env.HOST}`)
    )
  ) {
    return notFound();
  }
  const preferredUsername = resource
    .replace("acct:", "") // startsWithされてるので必ず先頭にある
    .split("@")[0]; // endsWithされてるので必ず1文字以上ある
  // TODO: 自ホストのユーザーのみ返す？hostも見る？
  const user = await prisma.user.findFirst({
    where: { preferredUsername },
  });
  if (!user) {
    return notFound();
  }
  return NextResponse.json(
    {
      subject: resource,
      links: [
        {
          rel: "self",
          type: "application/activity+json",
          href: `https://${env.HOST}/users/${user.id}`,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/jrd+json",
      },
    }
  );
}
