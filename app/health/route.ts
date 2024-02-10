// Stryker disable all
import { NextResponse } from "next/server";

import pkg from "@/../package.json";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    version: pkg.version,
    env: process.env,
  });
}
