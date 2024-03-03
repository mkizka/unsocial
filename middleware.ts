import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "./app/_shared/utils/env";
import { createLogger } from "./app/_shared/utils/logger";

const logger = createLogger("middleware");

const getBody = async (request: NextRequest) => {
  const body = await request.text();
  try {
    return JSON.parse(body);
  } catch (e) {
    return body;
  }
};

export async function middleware(request: NextRequest) {
  if (!process.env.CI && env.NODE_ENV === "production") {
    logger.info(
      `${request.method} ${request.nextUrl.pathname + request.nextUrl.search}`,
      {
        url: request.nextUrl.pathname,
        searchParams: Object.fromEntries(request.nextUrl.searchParams),
        method: request.method,
        headers: Object.fromEntries(request.headers),
        body: await getBody(request),
        date: new Date().toISOString(),
      },
    );
  }
  return NextResponse.next();
}
