import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createLogger } from "./app/_shared/utils/logger";

const logger = createLogger("middleware");

export function middleware(request: NextRequest) {
  if (!process.env.CI) {
    logger.info(
      `${request.method} ${request.nextUrl.pathname + request.nextUrl.search}`,
      {
        url: request.nextUrl.pathname,
        searchParams: Object.fromEntries(request.nextUrl.searchParams),
        method: request.method,
        headers: Object.fromEntries(request.headers),
        date: new Date().toISOString(),
      },
    );
  }
  return NextResponse.next();
}
