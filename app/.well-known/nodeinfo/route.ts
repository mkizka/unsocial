import { NextResponse } from "next/server";

import { env } from "@/_shared/utils/env";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      links: [
        {
          rel: "http://nodeinfo.diaspora.software/ns/schema/2.1",
          href: `https://${env.UNSOCIAL_HOST}/.well-known/nodeinfo/2.1`,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/jrd+json",
        "Cache-Control": "s-maxage=3600",
      },
    },
  );
}
