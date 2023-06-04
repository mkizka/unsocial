import { prisma } from "@soshal/database";
import { logger, signActivity } from "@soshal/utils";

const safeParse = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

export const relayActivity = async (id: string) => {
  const request = await prisma.relayRequest.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
  if (!request) {
    logger.error(`存在しないリレーリクエストが指定されました: ${id}`);
    return;
  }
  if (!request.user.privateKey) {
    logger.error(`秘密鍵がないユーザーでリレーしようとしました: ${id}`);
    return;
  }
  const activity = safeParse(request.activity);
  if (!activity || typeof activity !== "object") {
    logger.error(`Activityの形式が不正でした: ${id}`);
    return;
  }
  // TODO: 連合先の各サーバーに送信するようにする
  const inboxUrl = new URL("https://misskey.localhost/inbox");
  const signedHeaders = signActivity({
    sender: {
      id: request.user.id,
      privateKey: request.user.privateKey,
    },
    activity,
    inboxUrl,
  });
  logger.info(`リレー開始(${id}): ${request.activity}`);
  const response = await fetch(inboxUrl, {
    method: "POST",
    body: request.activity,
    headers: {
      "Content-Type": "application/activity+json",
      Accept: "application/activity+json",
      ...signedHeaders,
    },
  });
  logger.info(`リレー完了(${id}): ${response.status}`);
};
