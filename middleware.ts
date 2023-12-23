import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const logLevel = (status: number) => {
  if (status > 500) {
    return "error";
  }
  if (status === 400) {
    return "warn";
  }
  return "info";
};

export function middleware(request: NextRequest) {
  const pathWithQuery = request.nextUrl.pathname + request.nextUrl.search;
  const response = NextResponse.next();
  const level = logLevel(response.status);
  // https://docs.railway.app/guides/logs#structured-logs
  console[level](
    JSON.stringify({
      level,
      message: `${request.method} ${response.status} ${pathWithQuery}`,
      url: request.nextUrl.pathname,
      searchParams: Object.fromEntries(request.nextUrl.searchParams),
      method: request.method,
      headers: Object.fromEntries(request.headers),
      date: new Date().toISOString(),
      status: response.status,
    }),
  );
  return response;
}
