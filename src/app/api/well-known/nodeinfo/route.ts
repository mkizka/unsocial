import { NextResponse } from "next/server";

import { env } from "@/utils/env";

export async function GET() {
  return NextResponse.json(
    {
      links: [
        {
          rel: "http://nodeinfo.diaspora.software/ns/schema/2.1",
          href: `https://${env.HOST}/.well-known/nodeinfo/2.1`,
          VERCEL_URL: process.env.VERCEL_URL,
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
