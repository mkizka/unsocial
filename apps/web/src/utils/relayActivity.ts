import { prisma } from "@soshal/database";
import { env, logger } from "@soshal/utils";

export const relayActivity = async (userId: string, activity: object) => {
  if (env.NODE_ENV == "development" || env.E2E) {
    const stringified = JSON.stringify(activity);
    if (typeof stringified !== "string") {
      logger.error("Activityの形式が不正でした");
      return;
    }
    const request = await prisma.relayRequest.create({
      data: {
        userId,
        activity: stringified,
      },
    });
    await fetch("http://localhost:3001/relay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: request.id }),
    });
  } else {
    // TODO: Cloud Run Jobを呼び出す処理を書く
  }
};
