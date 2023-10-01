#!/usr/bin/env -S pnpm tsx
import { authorize } from "@/app/api/auth/[...nextauth]/route";
import { noteRepository, userRepository } from "@/server/repository";
import { env } from "@/utils/env";
import { createLogger } from "@/utils/logger";

const logger = createLogger("seed");

const main = async () => {
  const existingUser = await userRepository.findUnique({
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
      const publishedAt = new Date("2023-01-01T00:00:00Z");
      publishedAt.setSeconds(publishedAt.getSeconds() + i);
      await noteRepository.create({
        userId: user.id,
        content: "テスト " + publishedAt.toISOString(),
        publishedAt,
        attachments:
          i === 99
            ? [
                {
                  url: "https://via.placeholder.com/800x400",
                  mediaType: "image/png",
                },
              ]
            : [],
      });
    }),
  );
  logger.info("シード作成完了");
};

main().catch(console.error);
