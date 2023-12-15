"use server";
import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/_shared/utils/getSessionUser";

import { updateUserIconService } from "./updateUserIconService";

type State = {
  type: "success" | "error";
  message: string;
} | null;

export const action = async (_: State, formData: FormData): Promise<State> => {
  const icon = formData.get("icon");
  if (!icon || !(icon instanceof File)) {
    return {
      type: "error",
      message: "アイコンが選択されていません",
    };
  }
  const userId = await getSessionUserId({ redirect: true });
  await updateUserIconService.update(userId, icon);
  revalidatePath("/settings");
  return {
    type: "success",
    message: "アイコンを変更しました",
  };
};
