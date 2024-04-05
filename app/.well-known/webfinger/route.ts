import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

export async function GET({ nextUrl }: NextRequest) {
  const resource = nextUrl.searchParams.get("resource");
  if (
    !(
      resource &&
      resource.startsWith("acct:") &&
      // TODO: 自ホスト以外も返すべきなのか調べる
      resource.endsWith(`@${env.UNSOCIAL_HOST}`)
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
        host: env.UNSOCIAL_HOST,
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
          href: `https://${env.UNSOCIAL_HOST}/users/${user.id}/activity`,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/jrd+json",
        "Cache-Control": "max-age=0, s-maxage=3600",
      },
    },
  );
}
