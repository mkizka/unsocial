import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathWithQuery = request.nextUrl.pathname + request.nextUrl.search;
  // https://docs.railway.app/guides/logs#structured-logs
  console.info(
    JSON.stringify({
      level: "info",
      message: `${request.method} ${pathWithQuery}`,
      url: request.nextUrl.pathname,
      searchParams: Object.fromEntries(request.nextUrl.searchParams),
      method: request.method,
      headers: Object.fromEntries(request.headers),
      date: new Date().toISOString(),
    }),
  );
  return NextResponse.next();
}
