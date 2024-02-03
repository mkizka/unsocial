// Stryker disable all
import { NextResponse } from "next/server";

import pkg from "@/../package.json";
import { env } from "@/_shared/utils/env";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    version: pkg.version,
    env:
      env.NODE_ENV === "production"
        ? {
            NODE_ENV: env.NODE_ENV,
            UNSOCIAL_HOST: env.UNSOCIAL_HOST,
          }
        : env,
  });
}
