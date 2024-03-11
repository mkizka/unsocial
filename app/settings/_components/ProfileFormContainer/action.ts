"use server";
import { revalidatePath } from "next/cache";

import { userSessionService } from "@/_shared/user/services/userSessionService";
import type { FormAction } from "@/_shared/utils/formAction";
import { prisma } from "@/_shared/utils/prisma";

export const action: FormAction = async (_, formData) => {
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
      id: await userSessionService.getUserId({ redirect: true }),
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
