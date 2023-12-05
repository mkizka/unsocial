import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { prisma } from "@/utils/prisma";

import { NextResponse } from "next/server";

import { env } from "@/utils/env";

export async function GET({ nextUrl }: NextRequest) {
  const resource = nextUrl.searchParams.get("resource");
  if (
    !(
      resource &&
      resource.startsWith("acct:") &&
      // TODO: 自ホスト以外も返すべきなのか調べる
      resource.endsWith(`@${env.HOST}`)
    )
  ) {
    notFound();
  }
  const preferredUsername = resource
    .replace("acct:", "") // startsWithされてるので必ず先頭にある
    .split("@")[0]!; // endsWithされてるので必ず1文字以上ある
  const user = await prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername,
        host: env.HOST,
      },
    },
  });
  if (!user) {
    notFound();
  }
  return NextResponse.json(
    {
      subject: resource,
      links: [
        {
          rel: "self",
          type: "application/activity+json",
          href: `https://${env.HOST}/users/${user.id}/activity`,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/jrd+json",
      },
    },
  );
}
