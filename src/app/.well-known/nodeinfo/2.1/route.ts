import { NextResponse } from "next/server";

import pkg from "@/../package.json";
import { prisma } from "@/utils/prisma";

export async function GET() {
  const userCount = await prisma.user.count();
  // TODO: ローカルだけを対象に集計する
  const noteCount = await prisma.note.count();
  return NextResponse.json(
    {
      // https://nodeinfo.diaspora.software/protocol.html
      version: "2.1",
      software: {
        // TODO: 名前決まったら変える
        name: "soshal",
        version: pkg.version,
        repository: "https://github.com/mkizka/soshal.git",
        homepage: "https://github.com/mkizka/soshal",
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
    }
  );
}
