import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createLogger } from "@/_shared/utils/logger";

import { inboxService } from "./_services/inboxService";

const logger = createLogger("/inbox");

export async function POST(request: NextRequest) {
  const error = await inboxService.perform(request);
  if (error) {
    logger[error.level](error.message, {
      headers: Object.fromEntries(request.headers),
      body: await request.json(),
    });
  }
  // 処理に失敗したとしても202は返しておく
  return NextResponse.json("Accepted", { status: 202 });
}
