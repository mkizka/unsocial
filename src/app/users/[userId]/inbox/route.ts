import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { inboxService } from "@/server/service/inbox";
import { createLogger } from "@/utils/logger";

const logger = createLogger("/users/[userId]/inbox");

export async function POST(request: NextRequest) {
  const body = await request.json();
  const error = await inboxService.perform({
    activity: body,
    pathname: request.nextUrl.pathname,
    headers: request.headers,
  });
  if (error) {
    logger[error.level](error.message);
    return NextResponse.json({}, { status: error.statusCode });
  }
  return NextResponse.json({});
}
