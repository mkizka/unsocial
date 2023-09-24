"use server";

import { action as _action } from "./action";

export async function action(formData: FormData) {
  return await _action(formData);
}
