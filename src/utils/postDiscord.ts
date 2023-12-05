import { env } from "./env";
import { fetcher } from "./fetcher";
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
  if (env.NODE_ENV === "test") {
    return;
  }
  if (!env.DISCORD_WEBHOOK_URL) {
    logger.info("$DISCORD_WEBHOOK_URLがないのでDiscordへの投稿をスキップ");
    return;
  }
  const contents = sliceText(text, 1990);
  for (const content of contents) {
    await fetcher(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({ content: `\`\`\`\n${content}\n\`\`\`` }),
    })
      .then(() => logger.info(`Discordへの投稿に成功しました`))
      .catch((e) => logger.warn(`Discordへの投稿に失敗しました: ${e}`));
  }
};
