"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUser } from "@/utils/getServerSession";

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
  const user = await getUser();
  if (!user) {
    redirect("/auth");
  }
  await updateUserIconService.update(user.id, icon);
  revalidatePath("/settings");
  return {
    type: "success",
    message: "アイコンを変更しました",
  };
};
