"use server";
import { revalidatePath } from "next/cache";

import { userSessionService } from "@/_shared/user/services/userSessionService";

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
  const userId = await userSessionService.getUserId({ redirect: true });
  await updateUserIconService.update(userId, icon);
  revalidatePath("/settings");
  return {
    type: "success",
    message: "アイコンを変更しました",
  };
};
