import { NextResponse } from "next/server";

import pkg from "@/../package.json";
import { prisma } from "@/_shared/utils/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const userCount = await prisma.user.count();
  // TODO: ローカルだけを対象に集計する
  const noteCount = await prisma.note.count();
  return NextResponse.json(
    {
      // https://nodeinfo.diaspora.software/protocol.html
      version: "2.1",
      software: {
        name: "unsocial",
        version: pkg.version,
        repository: "https://github.com/mkizka/unsocial.git",
        homepage: "https://github.com/mkizka/unsocial",
      },
      protocols: ["activitypub"],
      services: { inbound: [], outbound: [] },
      openRegistrations: true,
      usage: {
        users: {
          total: userCount,
          // misskey.io が null になってたので
          activeHalfyear: null,
          activeMonth: null,
        },
        localPosts: noteCount,
        // 同上
        localComments: 0,
      },
      metadata: {},
    },
    {
      headers: {
        "Content-Type": "application/jrd+json",
      },
    },
  );
}
