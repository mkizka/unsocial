import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createLogger } from "@/_shared/utils/logger";

import { inboxService } from "./_services/inboxService";

const logger = createLogger("/users/[userId]/inbox");

export async function POST(request: NextRequest) {
  const error = await inboxService.perform(request);
  if (error) {
    logger[error.level](error.message);
    return NextResponse.json({}, { status: error.statusCode });
  }
  return NextResponse.json({});
}
