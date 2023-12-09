#!/usr/bin/env -S pnpm tsx
import { noteService } from "@/_shared/service";
import { userService } from "@/_shared/service/user";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

const logger = createLogger("seed");

const main = async () => {
  const existingUser = await prisma.user.findFirst({
    where: {
      preferredUsername: "test",
      host: env.HOST,
    },
  });
  if (existingUser) {
    logger.info("シード作成をスキップ");
    return;
  }
  const user = await userService.authorize({
    action: "signUp",
    name: "テスト",
    preferredUsername: "test",
    password: "testtest",
  });
  await Promise.all(
    Array.from({ length: 100 }).map(async (_, i) => {
      const publishedAt = new Date("2023-01-01T00:00:00Z");
      publishedAt.setSeconds(publishedAt.getSeconds() + i);
      await noteService.create({
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
                {
                  url: "https://via.placeholder.com/300x600",
                  mediaType: "image/png",
                },
                {
                  url: "https://via.placeholder.com/1000x500",
                  mediaType: "image/png",
                },
                {
                  url: "https://via.placeholder.com/600x1200",
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
