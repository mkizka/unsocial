"use server";
import { revalidatePath } from "next/cache";

import { action as _action } from "./action";

export async function action(followeeId: string) {
  await _action({ followeeId });
  revalidatePath(`/users/${followeeId}`);
}
