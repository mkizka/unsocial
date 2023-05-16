"use server";
import { redirect } from "next/navigation";

import { action as _action } from "./action";

export async function action(noteId: string) {
  await _action(noteId);
  redirect("/");
}
