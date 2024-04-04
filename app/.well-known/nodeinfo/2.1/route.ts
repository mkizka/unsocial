import { NextResponse } from "next/server";

import pkg from "@/../package.json";
import { prisma } from "@/_shared/utils/prisma";
import { serverInfo } from "@/_shared/utils/serverInfo";

import type { HttpNodeinfoDiasporaSoftwareNsSchema21 } from "./type";

export const dynamic = "force-dynamic";

export async function GET() {
  const localPosts = await prisma.note.count({
    where: {
      user: {
        isAdmin: true,
      },
    },
  });
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
      openRegistrations: false, // 管理者しか登録できない方針のため
      usage: {
        users: {
          total: 1,
        },
        localPosts,
      },
      metadata: {
        nodeName: serverInfo.name,
        nodeDescription: serverInfo.description,
        themeColor: serverInfo.themeColor,
      },
    } satisfies HttpNodeinfoDiasporaSoftwareNsSchema21,
    {
      headers: {
        "Content-Type": "application/jrd+json",
        "Cache-Control": "max-age=0, s-maxage=3600",
      },
    },
  );
}
