// Stryker disable all
import { NextResponse } from "next/server";

import { env } from "@/utils/env";

export function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      NODE_ENV: env.NODE_ENV,
      HOST: env.HOST,
      NEXTAUTH_URL: env.NEXTAUTH_URL,
    },
  });
}
