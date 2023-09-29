import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { inboxService } from "@/server/service/inbox";
import { createLogger } from "@/utils/logger";
import { postDicord } from "@/utils/postDiscord";

const logger = createLogger("/users/[userId]/inbox");

export async function POST(request: NextRequest) {
  const error = await inboxService.perform({
    activityRaw: await request.text(),
    pathname: request.nextUrl.pathname,
    headers: request.headers,
  });
  if (error) {
    logger[error.level](error.message);
    await postDicord(error.messageFormatted);
    return NextResponse.json({}, { status: error.statusCode });
  }
  return NextResponse.json({});
}
