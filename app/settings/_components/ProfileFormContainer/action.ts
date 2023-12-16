"use server";
import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/_shared/utils/getSessionUser";
import { prisma } from "@/_shared/utils/prisma";
import type { ServerAction } from "@/_shared/utils/serverAction";

export const action: ServerAction = async (_, formData) => {
  const name = formData.get("name");
  const summary = formData.get("summary");
  if (typeof name !== "string" || typeof summary !== "string") {
    return {
      type: "error",
      message: "入力内容が不正です",
    };
  }
  await prisma.user.update({
    where: {
      id: await getSessionUserId({ redirect: true }),
    },
    data: {
      name,
      summary,
    },
  });
  revalidatePath("/settings");
  return {
    type: "success",
    message: "プロフィールを更新しました",
  };
};
