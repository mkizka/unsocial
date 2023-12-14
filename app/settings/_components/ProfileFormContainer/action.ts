"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUser } from "@/_shared/utils/getServerSession";
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
  const user = await getUser();
  if (!user) {
    redirect("/auth");
  }
  await prisma.user.update({
    where: {
      id: user.id,
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
