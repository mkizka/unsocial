import { env } from "./env";
import { fetchJson } from "./fetchJson";
import { createLogger } from "./logger";

const logger = createLogger("postDiscord");

const sliceText = (text: string, count: number) => {
  const contents = [];
  let temp = `${text}`;
  while (temp.length > count) {
    contents.push(temp.slice(0, count));
    temp = temp.slice(count);
  }
  contents.push(temp);
  return contents;
};

export const postDicord = async (text: string) => {
  if (env.NODE_ENV == "test") {
    return;
  }
  if (!env.DISCORD_WEBHOOK_URL) {
    logger.info("$DISCORD_WEBHOOK_URLがないのでDiscordへの投稿をスキップ");
    return;
  }
  const contents = sliceText(`\`\`\`\n${text}\n\`\`\``, 2000);
  for (const content of contents) {
    await fetchJson(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({ content }),
    })
      .then(() => logger.info(`Discordへの投稿に成功しました`))
      .catch((e) => logger.warn(`Discordへの投稿に失敗しました: ${e}`));
  }
};
