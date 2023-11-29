"use server";
import { redirect } from "next/navigation";

import { updateUserIconService } from "@/server/service/updateUserIconService";
import { getUser } from "@/utils/getServerSession";

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
  const user = await getUser();
  if (!user) {
    redirect("/auth");
  }
  await updateUserIconService.update(user.id, icon);
  return {
    type: "success",
    message: "アイコンを変更しました",
  };
};