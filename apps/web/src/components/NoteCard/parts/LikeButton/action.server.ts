"use server";
import { revalidatePath } from "next/cache";

import { action as _action } from "./action";

export async function action(noteId: string) {
  await _action({ noteId, content: "👍" });
  revalidatePath(`/notes/${noteId}`);
}
