import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createLogger } from "@/_shared/utils/logger";

import { inboxService } from "./_services/inboxService";

const logger = createLogger("/users/[userId]/inbox");

const getLevel = (statusCode: number) => {
  if (statusCode >= 500) {
    return "error";
  }
  return "warn";
};

export async function POST(request: NextRequest) {
  const error = await inboxService.perform(request);
  if (error) {
    const level = getLevel(error.statusCode);
    logger[level](error.message, {
      headers: Object.fromEntries(request.headers),
      body: await request.json(),
    });
    return NextResponse.json({}, { status: error.statusCode });
  }
  return NextResponse.json({});
}
