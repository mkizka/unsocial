import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { inboxService } from "@/server/service/inbox";
import { UnexpectedActivityRequestError } from "@/server/service/inbox/shared";
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
    logger.warn(error.message);
    if (error instanceof UnexpectedActivityRequestError) {
      return NextResponse.json({}, { status: 500 });
    }
    return NextResponse.json({}, { status: 400 });
  }
  return NextResponse.json({}, { status: 200 });
}
