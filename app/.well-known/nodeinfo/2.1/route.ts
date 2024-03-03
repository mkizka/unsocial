import { NextResponse } from "next/server";

import pkg from "@/../package.json";
import { prisma } from "@/_shared/utils/prisma";
import { HttpNodeinfoDiasporaSoftwareNsSchema21 } from "./type";
import { serverInfo } from "@/_shared/utils/serverInfo";

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
      },
    },
  );
}
