import { env } from "./env";
import { fetchJson } from "./fetchJson";
import { createLogger } from "./logger";

const logger = createLogger("postDiscord");

export const postDicord = async (text: string) => {
  if (env.NODE_ENV == "test") {
    return;
  }
  if (!env.DISCORD_WEBHOOK_URL) {
    logger.info("$DISCORD_WEBHOOK_URLがないのでDiscordへの投稿をスキップ");
    return;
  }
  fetchJson(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({
      content: `\`\`\`\n${text}\n\`\`\``,
    }),
  }).catch(
    // @ts-expect-error
    (e) => {
      logger.warn(`Discordへの投稿に失敗しました: ${e}`);
    },
  );
};
