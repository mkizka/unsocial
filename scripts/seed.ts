#!/usr/bin/env -S pnpm tsx
import { authorize } from "@/app/api/auth/[...nextauth]/route";
import { noteRepository, userRepository } from "@/server/repository";
import { env } from "@/utils/env";
import { createLogger } from "@/utils/logger";

const logger = createLogger("seed");

const main = async () => {
  const existingUser = await userRepository.findFirst({
    preferredUsername: "test",
    host: env.HOST,
  });
  if (existingUser) {
    logger.info("シード作成をスキップ");
    return;
  }
  const user = await authorize({
    action: "signUp",
    name: "テスト",
    preferredUsername: "test",
    password: "testtest",
  });
  await Promise.all(
    Array.from({ length: 100 }).map(async (_, i) => {
      const published = new Date("2023-01-01T00:00:00Z");
      published.setSeconds(published.getSeconds() + i);
      await noteRepository.create({
        userId: user.id,
        content: "テスト " + published.toISOString(),
        published,
      });
    }),
  );
  logger.info("シード作成完了");
};

main().catch(console.error);
