"use server";
import { revalidatePath } from "next/cache";

import { action as _action } from "./action";

export async function action(userId: string) {
  await _action(userId);
  revalidatePath(`/users/${userId}`);
}
