import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { findOrFetchUserByActorId } from "@/utils/findOrFetchUser";
import { formatZodError } from "@/utils/formatZodError";
import { verifyActivity } from "@/utils/httpSignature/verify";
import { createLogger } from "@/utils/logger";

import { inbox } from "./_handlers";

const logger = createLogger("/users/[userId]/inbox");

const anyActivitySchema = z
  .object({
    actor: z.string().url(),
  })
  .passthrough();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const activity = anyActivitySchema.safeParse(body);
  if (!activity.success) {
    logger.info("検証失敗" + formatZodError(activity.error));
    return NextResponse.json({}, { status: 400 });
  }
  const actorUser = await findOrFetchUserByActorId(
    new URL(activity.data.actor)
  );
  if (!actorUser) {
    logger.info("actorで指定されたユーザーが見つかりませんでした");
    return NextResponse.json({}, { status: 400 });
  }
  // TODO: Userの公開鍵を必須にする
  const validation = verifyActivity(
    request.nextUrl.pathname,
    request.headers,
    actorUser.publicKey!
  );
  if (!validation.isValid) {
    logger.info("リクエストヘッダの署名が不正でした: " + validation.reason);
    return NextResponse.json({}, { status: 400 });
  }
  const result = await inbox(activity.data, actorUser);
  logger.info(
    request.nextUrl.pathname + `(${result.status}): ${result.message}`
  );
  return NextResponse.json({}, { status: result.status });
}
